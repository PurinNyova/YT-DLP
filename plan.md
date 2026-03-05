# YT-DLP Web Application — Project Plan

## Overview

A sleek, modern web application that leverages **yt-dlp** to download YouTube videos. Users paste a YouTube URL, choose between **audio** or **video** format, select from available qualities, and download the file.

---

## Technology Stack

| Layer | Technology |
| ---------- | ---------------------------------------- |
| **Backend** | Go (Gin framework) |
| **Database** | MySQL 8 (`100.87.104.102:3307`) |
| **Frontend** | React 18 + Vite + Chakra UI + Tailwind CSS |
| **CLI Tool** | yt-dlp (invoked server-side) |

---

## Architecture

```
┌──────────────┐ HTTP/REST ┌──────────────┐ exec ┌─────────┐
│ React SPA │ ◄──────────► │ Go API │ ──────► │ yt-dlp │
│ (Chakra+TW) │ │ (Gin) │ │ (CLI) │
└──────────────┘ └──────┬───────┘ └─────────┘
│
▼
┌──────────────┐
│ MySQL │
│ 100.87.104.102│
└──────────────┘
```

---

## Implementation Plan

### 1. Project Scaffolding

- [x] Initialize Git repository with MIT license
- [x] Create Go module (`backend/`)
- [x] Create React + Vite project (`frontend/`)
- [x] Configure Tailwind CSS + Chakra UI in frontend

### 2. Database Schema & Setup

- [x] Create `ytdlp` database
- [x] Create `downloads` table:
  - `id` — INT, PK, AUTO_INCREMENT
  - `video_url` — VARCHAR(512)
  - `title` — VARCHAR(512)
  - `format` — ENUM('audio', 'video')
  - `quality` — VARCHAR(50)
  - `file_path` — VARCHAR(1024)
  - `file_size` — BIGINT (bytes)
  - `status` — ENUM('pending', 'processing', 'completed', 'failed')
  - `error_message` — TEXT, nullable
  - `created_at` — DATETIME
  - `completed_at` — DATETIME, nullable

### 3. Backend — Go API (Gin)

- [x] **GET `/api/info`** — Accept `?url=<youtube_url>`, run `yt-dlp --dump-json` to return video metadata (title, thumbnail, available formats/qualities)
- [x] **POST `/api/download`** — Accept `{ url, format, quality }`, queue a download via yt-dlp, store record in DB, return download ID
- [x] **GET `/api/download/:id/status`** — Return current status of a download
- [x] **GET `/api/download/:id/file`** — Serve the downloaded file to the client
- [x] **GET `/api/downloads`** — List recent downloads (paginated)
- [x] Middleware: CORS, request logging, error recovery

### 4. Backend — yt-dlp Integration

- [x] Write a Go service that shells out to `yt-dlp` with appropriate flags
  - Audio: `yt-dlp -x --audio-format mp3 --audio-quality <quality> -o <output> <url>`
  - Video: `yt-dlp -f <format_id> -o <output> <url>`
- [x] Parse yt-dlp JSON output for available formats
- [x] Handle progress tracking and error capture

### 5. Frontend — Pages & Components

- [x] **Home Page (`/`)**
  - URL input bar (centered, prominent)
  - "Fetch Info" button
- [x] **Format Selection Panel**
  - Displays video thumbnail and title
  - Toggle: Audio / Video
  - Quality dropdown (populated from API)
  - "Download" button
- [x] **Download Status Card**
  - Progress indicator (pending → processing → completed)
  - Download link when ready
- [x] **History Page (`/history`)**
  - Table of recent downloads with status badges

### 6. Frontend — Styling

- [x] Dark-mode-first theme using Chakra UI color mode
- [x] Tailwind utilities for spacing, layout, responsiveness
- [x] Gradient accent colors, smooth transitions
- [x] Fully responsive (mobile-friendly)

### 7. Integration & Testing

- [x] Wire frontend to backend API
- [x] End-to-end test: paste URL → fetch info → select format → download
- [x] Error handling UI (invalid URL, yt-dlp failure, network errors)

### 8. Deployment Readiness

- [x] Dockerfile for backend
- [x] Environment variable configuration (`.env.example`)
- [x] README with setup and usage instructions

---

## API Summary

| Method | Endpoint | Description |
| ------ | ------------------------- | ---------------------------------- |
| GET | `/api/info?url=` | Fetch video metadata & formats |
| POST | `/api/download` | Start a download |
| GET | `/api/download/:id/status` | Check download status |
| GET | `/api/download/:id/file` | Download the completed file |
| GET | `/api/downloads` | List download history (paginated) |

---

## Database ERD

```
┌──────────────────────────┐
│ downloads │
├──────────────────────────┤
│ id INT PK AI │
│ video_url VARCHAR(512) │
│ title VARCHAR(512) │
│ format ENUM │
│ quality VARCHAR(50) │
│ file_path VARCHAR(1024) │
│ file_size BIGINT │
│ status ENUM │
│ error_message TEXT │
│ created_at DATETIME │
│ completed_at DATETIME │
└──────────────────────────┘
```

---

## Milestones

1. **Scaffolding** — Repo, Go module, React app, DB schema
2. **Backend Core** — API routes, yt-dlp integration, DB queries
3. **Frontend Core** — UI pages, API integration
4. **Polish** — Styling, error handling, responsiveness
5. **Ship** — Dockerfile, README, push to GitHub
