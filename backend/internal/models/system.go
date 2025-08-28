package models

// MemoryInfo holds parsed memory statistics
type MemoryInfo struct {
	Total int64  `json:"total"`  // Total memory in KB
	Free  int64  `json:"free"`   // Available memory in KB
	Used  int64  `json:"used"`  // Used memory in KB
}

// DiskInfo holds disk usage statistics
type DiskInfo struct {
	Total int64  `json:"total"`// Total disk space in bytes
	Free  int64  `json:"free"` // Free disk space in bytes
	Used  int64  `json:"used"` // Used disk space in bytes
}

// StorageInfo holds comprehensive storage information
type StorageInfo struct {
	RootPartition  DiskInfo            `json:"root_partition"`  // Root filesystem (/)
	Partitions     map[string]DiskInfo `json:"partitions"`      // All mounted partitions
	TotalDisks     int                 `json:"total_disks"`     // Number of physical disks
	StorageDevices []StorageDevice     `json:"storage_devices"` // Physical storage devices
}

// StorageDevice represents a physical storage device
type StorageDevice struct {
	Name       string `json:"name"`        // Device name (e.g., sda, mmcblk0)
	Size       int64  `json:"size"`        // Total size in bytes
	Type       string `json:"type"`        // Device type (SSD, HDD, SD, etc.)
	Mountpoint string `json:"mountpoint"`  // Where it's mounted
}

// NetworkInfo holds network configuration with multiple detection methods for robust fallback
type NetworkInfo struct {
	// Basic system information
	Hostname    string `json:"hostname"`    // Host system hostname
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

// PlatformInfo holds detected platform information (exported for debug endpoint)
type PlatformInfo struct {
	OS           string   `json:"os"`            // Operating system (linux, darwin, windows)
	Distribution string   `json:"distribution"`  // Linux distribution (ubuntu, debian, alpine, etc.)
	IsContainer  bool     `json:"is_container"`  // Running inside container
	Architecture string   `json:"architecture"`  // CPU architecture (amd64, arm64, arm)
	ThermalPaths []string `json:"thermal_paths"` // Available thermal sensor paths
	ProcPaths    []string `json:"proc_paths"`    // Available /proc paths
	EtcPaths     []string `json:"etc_paths"`     // Available /etc paths
	SysPaths     []string `json:"sys_paths"`     // Available /sys paths
}

// RebootMetrics holds reboot metrics
// type RebootMetrics struct {
//     StartTime    time.Time `json:"startTime"`
//     EndTime      time.Time `json:"endTime"`
//     Duration     time.Duration `json:"duration"`
//     TotalReboots int `json:"totalReboots"`
//     AvgDuration  time.Duration `json:"avgDuration"`
// }
