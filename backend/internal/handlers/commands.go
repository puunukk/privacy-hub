package handlers

import (
	"encoding/json"
	"net/http"
	"os/exec"
	"strings"

	"privacy-hub-backend/internal/models"
)

// Commands executes system commands via POST /cmd/{command}
func Commands(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract command from URL path
	command := strings.TrimPrefix(r.URL.Path, "/cmd/")
	response := models.CommandResponse{}
	
	switch command {
	case "shutdown":
		response.Status = "shutdown_initiated"
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
		exec.Command("shutdown", "-h", "+1").Run() // 1 MINUTE delay
		
	case "restart":
		response.Status = "restart_initiated"
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
		exec.Command("shutdown", "-r", "+1").Run() // 1 MINUTE delay
		
	case "force-shutdown":
		response.Status = "force_shutdown_initiated"
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
		exec.Command("poweroff", "-f").Run() // Immediate
		
	case "force-restart":
		response.Status = "force_restart_initiated"
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
		exec.Command("reboot", "-f").Run() // Immediate
		
	default:
		response.Error = "unknown_command"
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
	}
}