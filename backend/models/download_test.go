package models

import "testing"

func TestValidateURL(t *testing.T) {
	tests := []struct {
		name     string
		url      string
		platform string
		wantErr  bool
	}{
		// YouTube
		{"youtube valid", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "youtube", false},
		{"youtube short", "https://youtu.be/dQw4w9WgXcQ", "youtube", false},
		{"youtube wrong platform", "https://www.instagram.com/reel/abc", "youtube", true},

		// Instagram
		{"instagram reel", "https://www.instagram.com/reel/ABC123/", "instagram", false},
		{"instagram post", "https://www.instagram.com/p/ABC123/", "instagram", false},
		{"instagram wrong url", "https://www.youtube.com/watch?v=abc", "instagram", true},

		// X / Twitter
		{"x.com", "https://x.com/user/status/123456", "x", false},
		{"twitter.com", "https://twitter.com/user/status/123456", "x", false},
		{"x wrong url", "https://www.tiktok.com/@user/video/123", "x", true},

		// TikTok
		{"tiktok valid", "https://www.tiktok.com/@user/video/123456", "tiktok", false},
		{"tiktok wrong url", "https://www.youtube.com/watch?v=abc", "tiktok", true},

		// Edge cases
		{"invalid scheme", "ftp://youtube.com/watch?v=abc", "youtube", true},
		{"not a url", "not-a-url", "youtube", true},
		{"unknown platform", "https://example.com", "vimeo", true},
		{"empty url", "", "youtube", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateURL(tt.url, tt.platform)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateURL(%q, %q) error = %v, wantErr %v", tt.url, tt.platform, err, tt.wantErr)
			}
		})
	}
}
