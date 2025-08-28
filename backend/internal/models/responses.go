package models

// MetricsResponse contains real-time system metrics that change frequently
type MetricsResponse struct {
	CPUTemp     float64     `json:"cpu_temp"`     // CPU temperature in Celsius
	Memory      MemoryInfo  `json:"memory"`       // Memory information in KB values
	//MemoryFree  int64       `json:"memory_free"`  // Available memory in KB
	//MemoryTotal int64       `json:"memory_total"` // Total memory in KB  
	//MemoryUsed  int64       `json:"memory_used"`  // Used memory in KB
	LoadAvg     string      `json:"load_avg"`     // Load averages (1m 5m 15m)
	Storage     StorageInfo `json:"storage"`      // Comprehensive storage information
	Timestamp   int64       `json:"timestamp"`    // Unix timestamp
}

// InfoResponse contains system information with multiple detection methods for robust fallback
type InfoResponse struct {
	// Host System Information
	Hostname    string `json:"hostname"`    // Host system hostname (e.g. "otsi")
	Uptime      string `json:"uptime"`      // Host system uptime in seconds
	DNS         string `json:"dns"`         // Primary DNS server
	IsContainer bool   `json:"isContainer"` // True when backend runs in container
	
	// Main network detection results
	IP      string `json:"ip"`      // Host IP address
	Gateway string `json:"gateway"` // Host gateway address
	
	// Container Network Information (for debugging)
	ContainerIP      string `json:"container_ip,omitempty"`      // Docker container IP
	ContainerGateway string `json:"container_gateway,omitempty"` // Docker bridge gateway
}

// CommandResponse indicates command execution status
type CommandResponse struct {
	Status string `json:"status"`          // Command status
	Error  string `json:"error,omitempty"` // Error message if failed
}

// HealthResponse for health checks
type HealthResponse struct {
	Status string `json:"status"` // Always "ok" if service is running
}