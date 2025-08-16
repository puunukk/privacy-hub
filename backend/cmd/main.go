package main

import (
	"log"
	"runtime"

	"privacy-hub-backend/internal/server"
)

var (
	Version   = "1.0.0"
	BuildTime = "unknown"
	GitCommit = "unknown"
)

// main is the application entry point
func main() {
	log.Printf("🔒 Privacy Hub Backend v%s starting...", Version)
	log.Printf("📋 Build Info: %s/%s, Build: %s, Commit: %s", 
		runtime.GOOS, runtime.GOARCH, BuildTime, GitCommit)
	
	// Initialize and start server
	srv := server.New()
	if err := srv.Start("0.0.0.0:8111"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}