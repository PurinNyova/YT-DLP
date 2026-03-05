package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/PurinNyova/YT-DLP/backend/models"
	"github.com/PurinNyova/YT-DLP/backend/services"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	Service *services.YTDLPService
}

func NewHandler(service *services.YTDLPService) *Handler {
	return &Handler{Service: service}
}

// GetInfo handles GET /api/info?url=<youtube_url>
func (h *Handler) GetInfo(c *gin.Context) {
	url := c.Query("url")
	if url == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url parameter is required"})
		return
	}

	info, err := h.Service.FetchInfo(url)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, info)
}

// StartDownload handles POST /api/download
func (h *Handler) StartDownload(c *gin.Context) {
	var req models.DownloadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dl, err := h.Service.StartDownload(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"id":      dl.ID,
		"status":  dl.Status,
		"message": "Download started",
	})
}

// GetDownloadStatus handles GET /api/download/:id/status
func (h *Handler) GetDownloadStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid download ID"})
		return
	}

	dl, err := h.Service.GetDownload(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "download not found"})
		return
	}

	c.JSON(http.StatusOK, dl)
}

// GetDownloadFile handles GET /api/download/:id/file
func (h *Handler) GetDownloadFile(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid download ID"})
		return
	}

	dl, err := h.Service.GetDownload(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "download not found"})
		return
	}

	if dl.Status != "completed" {
		c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("download is %s", dl.Status)})
		return
	}

	if dl.FilePath == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
		return
	}

	filename := dl.Title
	if filename == "" {
		filename = fmt.Sprintf("download_%d", dl.ID)
	}

	ext := ".mp4"
	if dl.Format == "audio" {
		ext = ".mp3"
	}

	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s%s"`, filename, ext))
	c.File(dl.FilePath)
}

// ListDownloads handles GET /api/downloads
func (h *Handler) ListDownloads(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	downloads, total, err := h.Service.ListDownloads(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"downloads": downloads,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}
