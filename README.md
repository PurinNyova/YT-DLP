# YT-DLP Web

A modern web application for downloading YouTube videos and audio using [yt-dlp](https://github.com/yt-dlp/yt-dlp).

Paste a YouTube URL, pick **audio** or **video**, choose your quality, and download — all from a clean, dark-themed UI.

![MIT License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- Fetch YouTube video metadata (title, thumbnail, available formats)
- Download as **video** (MP4) or **audio** (MP3)
- Choose from all available quality options
- Real-time download status tracking
- Download history with status badges
- Dark-mode-first, fully responsive design

## Tech Stack

| Layer | Technology |
| -------- | ------------------------------------------ |
| Backend | Go 1.21+ / Gin |
| Database | MySQL 8 |
| Frontend | React 18 + Vite + Chakra UI + Tailwind CSS |
| CLI Tool | yt-dlp |

## Prerequisites

- **Go** 1.21+
- **Node.js** 18+
- **MySQL** 8 (running on `100.87.104.102:3307`)
- **yt-dlp** installed and available on `PATH`
- **ffmpeg** installed and available on `PATH` (required by yt-dlp for audio extraction)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PurinNyova/YT-DLP.git
cd YT-DLP
```

### 2. Database setup

Create the database and table:

```sql
CREATE DATABASE IF NOT EXISTS ytdlp;
USE ytdlp;

-- The backend will auto-migrate the schema on startup.
```

### 3. Backend

```bash
cd backend
cp .env.example .env   # edit DB credentials if needed
go mod download
go run .
```

The API server starts on **http://localhost:8080**.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on **http://localhost:5173** and proxies API requests to the backend.

## API Endpoints

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/api/info?url=`           | Fetch video metadata & formats  |
| POST   | `/api/download`            | Start a download                |
| GET    | `/api/download/:id/status` | Check download status           |
| GET    | `/api/download/:id/file`   | Download the completed file     |
| GET    | `/api/downloads`           | List download history           |

## Project Structure

```
YT-DLP/
├── backend/          # Go API server
│   ├── main.go
│   ├── handlers/     # HTTP handlers
│   ├── models/       # DB models
│   ├── services/     # yt-dlp + business logic
│   └── downloads/    # downloaded files (gitignored)
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   └── ...
├── plan.md
├── LICENSE
└── README.md
```

## License

[MIT](LICENSE)
