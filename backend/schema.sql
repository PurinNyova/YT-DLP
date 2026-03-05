-- Create database
CREATE DATABASE IF NOT EXISTS ytdlp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ytdlp;

-- Downloads table (also auto-migrated by GORM, but provided for reference)
CREATE TABLE IF NOT EXISTS downloads (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) DEFAULT '',
    video_url VARCHAR(512) NOT NULL,
    title VARCHAR(512) DEFAULT '',
    format ENUM('audio', 'video') NOT NULL,
    quality VARCHAR(50) DEFAULT '',
    file_path VARCHAR(1024) DEFAULT '',
    file_size BIGINT DEFAULT 0,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
