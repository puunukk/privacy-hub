package handlers

import (
	"encoding/json"
	"net/http"

	"privacy-hub-backend/internal/models"
	"privacy-hub-backend/internal/services"
)

// Info returns static system information
func Info(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get system information from services
	systemSvc := services.NewSystemService()
	networkSvc := services.NewNetworkService()
	
	networkInfo := networkSvc.GetNetworkInfo()
	
	// Get platform info for container detection
	platformSvc := services.NewPlatformService()
	platformInfo := platformSvc.GetPlatformInfo()
	
	response := models.InfoResponse{
		Hostname:    systemSvc.GetHostname(),
		IP:          networkInfo.IP,
		Gateway:     networkInfo.Gateway,
		DNS:         networkInfo.DNS,
		Uptime:      systemSvc.GetUptime(),
		IsContainer: platformInfo.IsContainer,
	}
	
	json.NewEncoder(w).Encode(response)
}