package services

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/PurinNyova/YT-DLP/backend/models"
	"gorm.io/gorm"
)

type YTDLPService struct {
	DB          *gorm.DB
	DownloadDir string
}

func NewYTDLPService(db *gorm.DB, downloadDir string) *YTDLPService {
	os.MkdirAll(downloadDir, 0755)
	return &YTDLPService{DB: db, DownloadDir: downloadDir}
}

// ytdlpRawFormat represents the raw JSON format entry from yt-dlp --dump-json
type ytdlpRawFormat struct {
	FormatID   string  `json:"format_id"`
	Ext        string  `json:"ext"`
	Resolution string  `json:"resolution"`
	Width      int     `json:"width"`
	Height     int     `json:"height"`
	VCodec     string  `json:"vcodec"`
	ACodec     string  `json:"acodec"`
	ABR        float64 `json:"abr"`
	FileSize   int64   `json:"filesize"`
	FormatNote string  `json:"format_note"`
}

type ytdlpRawInfo struct {
	Title     string           `json:"title"`
	Thumbnail string           `json:"thumbnail"`
	Duration  float64          `json:"duration"`
	Formats   []ytdlpRawFormat `json:"formats"`
}

// FetchInfo runs yt-dlp --dump-json and returns parsed video information
func (s *YTDLPService) FetchInfo(url string) (*models.VideoInfo, error) {
	cmd := exec.Command("yt-dlp", "--dump-json", "--no-warnings", url)
	output, err := cmd.Output()
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			return nil, fmt.Errorf("yt-dlp error: %s", string(exitErr.Stderr))
		}
		return nil, fmt.Errorf("failed to run yt-dlp: %w", err)
	}

	var raw ytdlpRawInfo
	if err := json.Unmarshal(output, &raw); err != nil {
		return nil, fmt.Errorf("failed to parse yt-dlp output: %w", err)
	}

	info := &models.VideoInfo{
		Title:     raw.Title,
		Thumbnail: raw.Thumbnail,
		Duration:  raw.Duration,
	}

	seen := make(map[string]bool)

	for _, f := range raw.Formats {
		isVideo := f.VCodec != "" && f.VCodec != "none"
		isAudio := f.ACodec != "" && f.ACodec != "none"

		if isVideo && f.Height > 0 {
			quality := fmt.Sprintf("%dp", f.Height)
			key := "video-" + quality
			if !seen[key] {
				seen[key] = true
				info.Formats = append(info.Formats, models.FormatInfo{
					FormatID:   f.FormatID,
					Extension:  f.Ext,
					Resolution: f.Resolution,
					FileSize:   f.FileSize,
					VCodec:     f.VCodec,
					ACodec:     f.ACodec,
					Type:       "video",
					Quality:    quality,
				})
			}
		}

		if isAudio && !isVideo {
			quality := "unknown"
			if f.ABR > 0 {
				quality = strconv.Itoa(int(f.ABR)) + "kbps"
			}
			key := "audio-" + quality
			if !seen[key] {
				seen[key] = true
				info.Formats = append(info.Formats, models.FormatInfo{
					FormatID:  f.FormatID,
					Extension: f.Ext,
					ABR:       f.ABR,
					ACodec:    f.ACodec,
					Type:      "audio",
					Quality:   quality,
				})
			}
		}
	}

	return info, nil
}

// StartDownload creates a DB record and starts the download in a goroutine.
// If a completed download with the same video_url, format, and quality already
// exists and the file is still on disk, reuse it instead of re-downloading.
func (s *YTDLPService) StartDownload(req models.DownloadRequest, userID string) (*models.Download, error) {
	// Check for an existing completed download with the same video+format+quality
	var existing models.Download
	err := s.DB.Where("video_url = ? AND format = ? AND quality = ? AND status = ?",
		req.URL, req.Format, req.Quality, "completed").
		First(&existing).Error

	if err == nil && existing.FilePath != "" {
		// Verify the file still exists on disk
		if _, statErr := os.Stat(existing.FilePath); statErr == nil {
			now := time.Now()
			dl := models.Download{
				UserID:      userID,
				VideoURL:    req.URL,
				Format:      req.Format,
				Quality:     req.Quality,
				Title:       existing.Title,
				FilePath:    existing.FilePath,
				FileSize:    existing.FileSize,
				Status:      "completed",
				CompletedAt: &now,
			}
			if err := s.DB.Create(&dl).Error; err != nil {
				return nil, fmt.Errorf("failed to create download record: %w", err)
			}
			return &dl, nil
		}
	}

	dl := models.Download{
		UserID:   userID,
		VideoURL: req.URL,
		Format:   req.Format,
		Quality:  req.Quality,
		Status:   "pending",
	}

	if err := s.DB.Create(&dl).Error; err != nil {
		return nil, fmt.Errorf("failed to create download record: %w", err)
	}

	go s.processDownload(&dl)
	return &dl, nil
}

func (s *YTDLPService) processDownload(dl *models.Download) {
	s.DB.Model(dl).Update("status", "processing")

	// Build output path
	safeTitle := sanitizeFilename(dl.Title)
	if safeTitle == "" {
		safeTitle = fmt.Sprintf("download_%d", dl.ID)
	}

	var args []string
	var ext string

	if dl.Format == "audio" {
		ext = "mp3"
		outputPath := filepath.Join(s.DownloadDir, fmt.Sprintf("%d_%s.%s", dl.ID, safeTitle, ext))
		args = []string{
			"-x",
			"--audio-format", "mp3",
			"--audio-quality", s.audioQualityFlag(dl.Quality),
			"-o", outputPath,
			"--no-warnings",
			dl.VideoURL,
		}
	} else {
		ext = "mp4"
		outputPath := filepath.Join(s.DownloadDir, fmt.Sprintf("%d_%s.%s", dl.ID, safeTitle, ext))
		formatSpec := s.videoFormatSpec(dl.Quality)
		args = []string{
			"-f", formatSpec,
			"--merge-output-format", "mp4",
			"-o", outputPath,
			"--no-warnings",
			dl.VideoURL,
		}
	}

	// First, get the title
	titleCmd := exec.Command("yt-dlp", "--get-title", "--no-warnings", dl.VideoURL)
	if titleOut, err := titleCmd.Output(); err == nil {
		title := strings.TrimSpace(string(titleOut))
		s.DB.Model(dl).Update("title", title)
		dl.Title = title

		// Rebuild path with actual title
		safeTitle = sanitizeFilename(title)
		outputPath := filepath.Join(s.DownloadDir, fmt.Sprintf("%d_%s.%s", dl.ID, safeTitle, ext))
		// Update the -o flag in args
		for i, arg := range args {
			if arg == "-o" && i+1 < len(args) {
				args[i+1] = outputPath
			}
		}
	}

	cmd := exec.Command("yt-dlp", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		errMsg := fmt.Sprintf("yt-dlp failed: %s\nOutput: %s", err.Error(), string(output))
		s.DB.Model(dl).Updates(map[string]interface{}{
			"status":        "failed",
			"error_message": errMsg,
		})
		return
	}

	// Find the actual downloaded file
	expectedPath := ""
	for i, arg := range args {
		if arg == "-o" && i+1 < len(args) {
			expectedPath = args[i+1]
		}
	}

	var fileSize int64
	if info, err := os.Stat(expectedPath); err == nil {
		fileSize = info.Size()
	}

	now := time.Now()
	s.DB.Model(dl).Updates(map[string]interface{}{
		"status":       "completed",
		"file_path":    expectedPath,
		"file_size":    fileSize,
		"completed_at": now,
	})
}

func (s *YTDLPService) audioQualityFlag(quality string) string {
	// quality is like "128kbps" — extract the number
	q := strings.TrimSuffix(quality, "kbps")
	if _, err := strconv.Atoi(q); err == nil {
		return q + "K"
	}
	return "0" // best quality
}

func (s *YTDLPService) videoFormatSpec(quality string) string {
	// quality is like "1080p" — extract height
	height := strings.TrimSuffix(quality, "p")
	if _, err := strconv.Atoi(height); err == nil {
		return fmt.Sprintf("bestvideo[height<=%s]+bestaudio/best[height<=%s]", height, height)
	}
	return "bestvideo+bestaudio/best"
}

// GetDownload returns a download record by ID
func (s *YTDLPService) GetDownload(id uint) (*models.Download, error) {
	var dl models.Download
	if err := s.DB.First(&dl, id).Error; err != nil {
		return nil, err
	}
	return &dl, nil
}

// ListDownloads returns recent downloads for a specific user, paginated
func (s *YTDLPService) ListDownloads(page, pageSize int, userID string) ([]models.Download, int64, error) {
	var downloads []models.Download
	var total int64

	query := s.DB.Model(&models.Download{}).Where("user_id = ?", userID)
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&downloads).Error; err != nil {
		return nil, 0, err
	}

	return downloads, total, nil
}

func sanitizeFilename(name string) string {
	replacer := strings.NewReplacer(
		"/", "_", "\\", "_", ":", "_", "*", "_",
		"?", "_", "\"", "_", "<", "_", ">", "_",
		"|", "_",
	)
	result := replacer.Replace(name)
	if len(result) > 100 {
		result = result[:100]
	}
	return strings.TrimSpace(result)
}
