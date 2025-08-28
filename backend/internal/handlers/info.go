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

	// Use the PRIVILEGED network service with nsenter
	networkSvc := services.NewPrivilegedNetworkService()
	networkInfo := networkSvc.GetNetworkInfo()
	
	response := models.InfoResponse{
		Hostname:         networkInfo.Hostname,
		IP:               networkInfo.IP,
		Gateway:          networkInfo.Gateway,
		DNS:              networkInfo.DNS,
		Uptime:           networkInfo.Uptime,
		IsContainer:      networkInfo.IsContainer,
		ContainerIP:      networkInfo.ContainerIP,
		ContainerGateway: networkInfo.ContainerGateway,
	}
	
	json.NewEncoder(w).Encode(response)
}