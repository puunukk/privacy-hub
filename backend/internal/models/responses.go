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

// InfoResponse contains static system information that rarely changes
type InfoResponse struct {
	Hostname string `json:"hostname"` // System hostname
	IP       string `json:"ip"`       // Primary IP address
	Gateway  string `json:"gateway"`  // Default gateway
	DNS      string `json:"dns"`      // Primary DNS server
	Uptime   string `json:"uptime"`   // System uptime in seconds
	IsContainer bool `json:"isContainer"` // Whether the system is running in a container
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