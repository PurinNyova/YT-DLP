# Build stage
FROM golang:1.21-alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# Runtime stage
FROM alpine:3.19

RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    ca-certificates \
    && pip3 install --break-system-packages yt-dlp

WORKDIR /app

COPY --from=builder /app/server .
COPY .env.example .env

RUN mkdir -p /app/downloads

EXPOSE 8080

CMD ["./server"]
