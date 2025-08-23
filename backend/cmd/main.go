package main

import (
	"log"
	"os"
	"runtime"

	"privacy-hub-backend/internal/server"
)

var (
	Version   = "1.0.0"
	BuildTime = "unknown"
	GitCommit = "unknown"
)

// getEnvOrDefault returns environment variable value or default if not set
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// main is the application entry point
func main() {
	// Get configuration from environment variables
	serverHost := getEnvOrDefault("SERVER_HOST", "0.0.0.0")
	serverPort := getEnvOrDefault("SERVER_PORT", "8080")
	environment := getEnvOrDefault("GO_ENV", "development")
	
	// Build listen address from environment
	listenAddr := serverHost + ":" + serverPort
	
	log.Printf("🔒 Privacy Hub Backend v%s starting...", Version)
	log.Printf("📋 Build Info: %s/%s, Build: %s, Commit: %s", 
		runtime.GOOS, runtime.GOARCH, BuildTime, GitCommit)
	log.Printf("🌍 Environment: %s", environment)
	log.Printf("📡 Server listening on: %s", listenAddr)
	
	// Initialize and start server with configurable address
	srv := server.New()
	if err := srv.Start(listenAddr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}