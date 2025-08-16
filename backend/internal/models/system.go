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

// NetworkInfo holds network configuration
type NetworkInfo struct {
	IP      string // Primary IP address
	Gateway string // Default gateway
	DNS     string // Primary DNS server
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