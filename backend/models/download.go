package models

import (
	"fmt"
	"net/url"
	"strings"
	"time"
)

type Download struct {
	ID           uint       `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID       string     `json:"user_id" gorm:"size:36;index"`
	VideoURL     string     `json:"video_url" gorm:"size:512;not null"`
	Title        string     `json:"title" gorm:"size:512"`
	Platform     string     `json:"platform" gorm:"size:20;default:'youtube'"`
	Format       string     `json:"format" gorm:"type:enum('audio','video');not null"`
	Quality      string     `json:"quality" gorm:"size:50"`
	FilePath     string     `json:"-" gorm:"size:1024"`
	FileSize     int64      `json:"file_size"`
	Status       string     `json:"status" gorm:"type:enum('pending','processing','completed','failed');default:'pending'"`
	ErrorMessage *string    `json:"error_message,omitempty" gorm:"type:text"`
	CreatedAt    time.Time  `json:"created_at" gorm:"autoCreateTime"`
	CompletedAt  *time.Time `json:"completed_at,omitempty"`
}

type VideoInfo struct {
	Title     string        `json:"title"`
	Thumbnail string        `json:"thumbnail"`
	Duration  float64       `json:"duration"`
	Formats   []FormatInfo  `json:"formats"`
}

type FormatInfo struct {
	FormatID   string  `json:"format_id"`
	Extension  string  `json:"ext"`
	Resolution string  `json:"resolution,omitempty"`
	FileSize   int64   `json:"filesize,omitempty"`
	VCodec     string  `json:"vcodec,omitempty"`
	ACodec     string  `json:"acodec,omitempty"`
	ABR        float64 `json:"abr,omitempty"`
	Type       string  `json:"type"` // "audio" or "video"
	Quality    string  `json:"quality"`
}

type DownloadRequest struct {
	URL      string `json:"url" binding:"required"`
	Format   string `json:"format" binding:"required,oneof=audio video"`
	Quality  string `json:"quality" binding:"required"`
	Platform string `json:"platform"`
}

// ValidPlatforms lists all supported platforms.
var ValidPlatforms = []string{"youtube", "instagram", "x", "tiktok"}

// ValidateURL checks that the URL is well-formed and belongs to the given platform.
func ValidateURL(rawURL, platform string) error {
	parsed, err := url.Parse(rawURL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return fmt.Errorf("invalid URL")
	}
	host := strings.ToLower(parsed.Hostname())

	switch platform {
	case "youtube":
		if !strings.Contains(host, "youtube.com") && !strings.Contains(host, "youtu.be") {
			return fmt.Errorf("URL does not match YouTube")
		}
	case "instagram":
		if !strings.Contains(host, "instagram.com") {
			return fmt.Errorf("URL does not match Instagram")
		}
	case "x":
		if !strings.Contains(host, "x.com") && !strings.Contains(host, "twitter.com") {
			return fmt.Errorf("URL does not match X/Twitter")
		}
	case "tiktok":
		if !strings.Contains(host, "tiktok.com") {
			return fmt.Errorf("URL does not match TikTok")
		}
	default:
		return fmt.Errorf("unsupported platform: %s", platform)
	}
	return nil
}
