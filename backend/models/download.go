package models

import "time"

type Download struct {
	ID           uint       `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID       string     `json:"user_id" gorm:"size:36;index"`
	VideoURL     string     `json:"video_url" gorm:"size:512;not null"`
	Title        string     `json:"title" gorm:"size:512"`
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
	URL     string `json:"url" binding:"required"`
	Format  string `json:"format" binding:"required,oneof=audio video"`
	Quality string `json:"quality" binding:"required"`
}
