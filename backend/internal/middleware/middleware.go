package middleware

import (
	"net/http"
)

// Middleware type for function composition
type Middleware func(http.Handler) http.Handler

// Chain combines multiple middlewares into one
func Chain(middlewares ...Middleware) Middleware {
	return func(handler http.Handler) http.Handler {
		// Apply middlewares in reverse order so they execute in correct order
		for i := len(middlewares) - 1; i >= 0; i-- {
			handler = middlewares[i](handler)
		}
		return handler
	}
}

// CORS middleware handles Cross-Origin Resource Sharing
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Max-Age", "86400") // 24 hours
		
		// Handle preflight OPTIONS request
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		// Continue to next handler
		next.ServeHTTP(w, r)
	})
}

// JSON middleware sets JSON content type
func JSON(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

// Logging middleware logs requests
func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Simple request logging
		// You can expand this with more detailed logging
		next.ServeHTTP(w, r)
	})
}

// APIMiddleware is a pre-composed middleware stack for API endpoints
var APIMiddleware = Chain(
	CORS,    // Handle CORS first
	JSON,    // Set JSON content type
	Logging, // Log requests
)

// Helper function to wrap handler functions with middleware
func Apply(middleware Middleware, handler http.HandlerFunc) http.Handler {
	return middleware(handler)
}
