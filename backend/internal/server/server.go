package server

import (
	"net/http"

	"privacy-hub-backend/internal/handlers"
	"privacy-hub-backend/internal/middleware"
)

// Server represents the HTTP server
type Server struct {
	mux *http.ServeMux
}

// New creates a new server instance
func New() *Server {
	s := &Server{
		mux: http.NewServeMux(),
	}
	
	s.setupRoutes()
	return s
}

// setupRoutes configures all HTTP routes
func (s *Server) setupRoutes() {
	
    api := middleware.APIMiddleware  // CORS + JSON only
    
	// Health endpoint
	s.mux.Handle("/health", api(http.HandlerFunc(handlers.Health)))

	// System monitoring endpoints
	s.mux.Handle("/metrics", api(http.HandlerFunc(handlers.Metrics)))
	s.mux.Handle("/info", api(http.HandlerFunc(handlers.Info)))
	
	// Command endpoints
	s.mux.Handle("/cmd/", api(http.HandlerFunc(handlers.Commands)))
	//s.mux.Handle("/power/", api(http.HandlerFunc(handlers.PowerCommands)))
	
	// Debug endpoint (shows platform detection info)
	s.mux.Handle("/debug", api(http.HandlerFunc(handlers.Debug)))
}

// Start starts the HTTP server on the given address
func (s *Server) Start(addr string) error {
	return http.ListenAndServe(addr, s.mux)
}