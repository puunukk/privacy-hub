package handlers

import (
	"encoding/json"
	"log"
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
	case "restart-services":
		response.Status = "restart_services_initiated"
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
		exec.Command("docker", "compose", "restart").Run()

	case "shutdown":
		response.Status = "shutdown_initiated"
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
		exec.Command("systemctl", "poweroff", "now").Run()
		
	case "restart":
	case "reboot":
		response.Status = "restart_initiated"
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
		
		// Execute reboot command with error logging
		go func() {
			// Try different reboot command paths that might be available
			cmd := exec.Command("reboot")
			output, err := cmd.CombinedOutput()
			if err != nil {
				log.Printf("Reboot command failed: %v, output: %s", err, string(output))
				// Try alternative approach
				cmd2 := exec.Command("shutdown", "-r", "now")
				output2, err2 := cmd2.CombinedOutput()
				if err2 != nil {
					log.Printf("Shutdown -r command also failed: %v, output: %s", err2, string(output2))
				} else {
					log.Printf("Shutdown -r command executed successfully: %s", string(output2))
				}
			} else {
				log.Printf("Reboot command executed successfully: %s", string(output))
			}
		}()
		
	case "force-shutdown":
		response.Status = "force_shutdown_initiated"
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
		exec.Command("poweroff", "-f").Run()
		
	case "force-restart":
	case "force-reboot":
		response.Status = "force_restart_initiated"
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
		exec.Command("reboot", "-f").Run()
		
	default:
		response.Error = "unknown_command"
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
	}
}