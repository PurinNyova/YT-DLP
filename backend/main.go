package main

import (
	"fmt"
	"log"
	"os"

	"github.com/PurinNyova/YT-DLP/backend/handlers"
	"github.com/PurinNyova/YT-DLP/backend/models"
	"github.com/PurinNyova/YT-DLP/backend/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// Load .env
	godotenv.Load()

	// Database connection
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		getEnv("DB_USER", "root"),
		getEnv("DB_PASSWORD", ""),
		getEnv("DB_HOST", "100.87.104.102"),
		getEnv("DB_PORT", "3307"),
		getEnv("DB_NAME", "ytdlp"),
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Connected to MySQL database")

	// Auto-migrate
	if err := db.AutoMigrate(&models.Download{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migrated")

	// Services
	downloadDir := getEnv("DOWNLOAD_DIR", "./downloads")
	ytdlpService := services.NewYTDLPService(db, downloadDir)

	// Handlers
	h := handlers.NewHandler(ytdlpService)

	// Router
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	// API routes
	api := r.Group("/api")
	{
		api.GET("/info", h.GetInfo)
		api.POST("/download", h.StartDownload)
		api.GET("/download/:id/status", h.GetDownloadStatus)
		api.GET("/download/:id/file", h.GetDownloadFile)
		api.GET("/downloads", h.ListDownloads)
	}

	port := getEnv("PORT", "8080")
	log.Printf("Server starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
