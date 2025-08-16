package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"privacy-hub-backend/internal/models"
	"privacy-hub-backend/internal/services"
)

// Metrics returns real-time system metrics
func Metrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get system information from services
	systemSvc := services.NewSystemService()
	storageSvc := services.NewStorageService()
	
	memInfo := systemSvc.GetMemoryInfo()
	storageInfo := storageSvc.GetStorageInfo()
	
	response := models.MetricsResponse{
		CPUTemp:     systemSvc.GetCPUTemp(),
		MemoryFree:  memInfo.Free,
		MemoryTotal: memInfo.Total,
		MemoryUsed:  memInfo.Used,
		LoadAvg:     systemSvc.GetLoadAvg(),
		Storage:     storageInfo,
		Timestamp:   time.Now().Unix(),
	}
	
	json.NewEncoder(w).Encode(response)
}