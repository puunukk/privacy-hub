package handlers

import (
	"encoding/json"
	"net/http"

	"privacy-hub-backend/internal/models"
)

// Health returns the service health status
func Health(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := models.HealthResponse{
		Status: "ok",
	}
	
	json.NewEncoder(w).Encode(response)
}