package handlers

import (
	"encoding/json"
	"net/http"

	"privacy-hub-backend/internal/models"
	"privacy-hub-backend/internal/services"
)

// DebugResponse contains platform and system detection information
type DebugResponse struct {
	Platform    *models.PlatformInfo `json:"platform"`
	ThermalPath string               `json:"thermal_path"`
	Paths       struct {
		Proc []string `json:"proc_paths"`
		Sys  []string `json:"sys_paths"`
		Etc  []string `json:"etc_paths"`
	} `json:"available_paths"`
}

// Debug returns platform detection and system information for debugging
func Debug(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get platform information from system service
	systemSvc := services.NewSystemService()
	platformInfo := systemSvc.GetPlatformInfo()
	
	// Create platform service to get thermal path
	platformSvc := services.NewPlatformService()
	
	response := DebugResponse{
		Platform:    platformInfo,
		ThermalPath: platformSvc.GetBestThermalPath(),
	}
	
	response.Paths.Proc = platformInfo.ProcPaths
	response.Paths.Sys = platformInfo.SysPaths
	response.Paths.Etc = platformInfo.EtcPaths
	
	json.NewEncoder(w).Encode(response)
}