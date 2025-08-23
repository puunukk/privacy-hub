package services

import (
	"fmt"
	"os"
	"runtime"
	"strings"

	"privacy-hub-backend/internal/models"
	"privacy-hub-backend/internal/utils"
)

// PlatformService handles platform detection and path resolution
type PlatformService struct {
	info *models.PlatformInfo
}

// NewPlatformService creates and initializes platform detection
func NewPlatformService() *PlatformService {
	svc := &PlatformService{}
	svc.detectPlatform()
	return svc
}

// GetPlatformInfo returns detected platform information
func (s *PlatformService) GetPlatformInfo() *models.PlatformInfo {
	return s.info
}

// detectPlatform performs comprehensive platform detection
func (s *PlatformService) detectPlatform() {
	// Initialize info first
	s.info = &models.PlatformInfo{
		OS:           runtime.GOOS,
		Architecture: runtime.GOARCH,
		IsContainer:  s.detectContainer(),
	}
	
	// Now detect distribution after info is initialized
	s.info.Distribution = s.detectDistribution()
	
	// Set up paths based on detected platform
	s.setupPaths()
}

// detectContainer checks if we're running inside a container
func (s *PlatformService) detectContainer() bool {
	fmt.Printf("DEBUG: Starting container detection\n")
	
	// Check for container-specific files/directories (most reliable)
	containerIndicators := []string{
		"/.dockerenv",                    // Docker
		"/run/.containerenv",             // Podman
	}
	
	for _, indicator := range containerIndicators {
		if _, err := os.Stat(indicator); err == nil {
			fmt.Printf("DEBUG: Found container indicator: %s\n", indicator)
			return true
		}
	}
	
	// Check if /proc/1/cgroup contains container indicators
	if data, err := utils.ReadFile("/proc/1/cgroup"); err == nil {
		containerKeywords := []string{"docker", "containerd", "kubepods", "lxc", "crio"}
		for _, keyword := range containerKeywords {
			if strings.Contains(strings.ToLower(data), keyword) {
				fmt.Printf("DEBUG: Found container keyword in cgroup: %s\n", keyword)
				return true
			}
		}
	}
	
	// Check if we have typical container environment variables
	if os.Getenv("DOCKER_CONTAINER") != "" || 
	   os.Getenv("container") != "" ||
	   os.Getenv("KUBERNETES_SERVICE_HOST") != "" {
		fmt.Printf("DEBUG: Found container environment variables\n")
		return true
	}
	
	// More sophisticated hostname check - only flag as container if very specific patterns
	if hostname, err := os.Hostname(); err == nil {
		fmt.Printf("DEBUG: Checking hostname: %s\n", hostname)
		
		// Container hostnames are typically:
		// - Exactly 64 hex characters (Docker container IDs)
		// - Random strings with no dots (like "abc123def456")
		// - Kubernetes pod names (like "pod-12345-abcde")
		if len(hostname) == 64 {
			// Check if it's all hex characters (Docker container ID)
			isHex := true
			for _, char := range strings.ToLower(hostname) {
				if !((char >= '0' && char <= '9') || (char >= 'a' && char <= 'f')) {
					isHex = false
					break
				}
			}
			if isHex {
				fmt.Printf("DEBUG: Hostname appears to be Docker container ID\n")
				return true
			}
		}
		
		// Check for Kubernetes pod naming patterns (but allow normal hostnames with domains)
		if strings.Contains(hostname, "-") && !strings.Contains(hostname, ".") {
			// This could be a pod name, but let's be more specific
			parts := strings.Split(hostname, "-")
			if len(parts) >= 3 {
				// Kubernetes pods often have format: name-hash-hash or name-deployment-hash
				fmt.Printf("DEBUG: Hostname might be Kubernetes pod\n")
				return true
			}
		}
	}
	
	fmt.Printf("DEBUG: No container indicators found - running on host\n")
	return false
}

// detectDistribution identifies the Linux distribution
func (s *PlatformService) detectDistribution() string {
	if s.info.OS != "linux" {
		return ""
	}
	
	// Try different methods to detect distribution
	distroSources := []struct {
		file   string
		parser func(string) string
	}{
		{"/etc/os-release", s.parseOSRelease},
		{"/etc/lsb-release", s.parseLSBRelease},
		{"/etc/redhat-release", s.parseRedhatRelease},
		{"/etc/debian_version", func(string) string { return "debian" }},
		{"/etc/alpine-release", func(string) string { return "alpine" }},
	}
	
	for _, source := range distroSources {
		if data, err := utils.ReadFile(source.file); err == nil {
			if distro := source.parser(data); distro != "" {
				return distro
			}
		}
	}
	
	return "unknown"
}

// parseOSRelease extracts distribution from /etc/os-release
func (s *PlatformService) parseOSRelease(data string) string {
	lines := strings.Split(data, "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, "ID=") {
			value := strings.Trim(strings.TrimPrefix(line, "ID="), `"`)
			return strings.ToLower(value)
		}
	}
	return ""
}

// parseLSBRelease extracts distribution from /etc/lsb-release
func (s *PlatformService) parseLSBRelease(data string) string {
	lines := strings.Split(data, "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, "DISTRIB_ID=") {
			value := strings.Trim(strings.TrimPrefix(line, "DISTRIB_ID="), `"`)
			return strings.ToLower(value)
		}
	}
	return ""
}

// parseRedhatRelease extracts distribution from /etc/redhat-release
func (s *PlatformService) parseRedhatRelease(data string) string {
	data = strings.ToLower(data)
	if strings.Contains(data, "centos") {
		return "centos"
	}
	if strings.Contains(data, "red hat") || strings.Contains(data, "rhel") {
		return "rhel"
	}
	if strings.Contains(data, "fedora") {
		return "fedora"
	}
	return "redhat"
}

// setupPaths configures platform-specific paths
func (s *PlatformService) setupPaths() {
	basePaths := map[string][]string{
		"proc": {"/proc"},
		"sys":  {"/sys"},
		"etc":  {"/etc"},
	}
	
	// Add container-specific paths if detected
	if s.info.IsContainer {
		// Common host mount points for containers
		hostMounts := []string{
			"/host",           // Standard host mount
			"/hostfs",         // Alternative host mount
			"/mnt/host",       // Another common pattern
		}
		
		for _, mount := range hostMounts {
			// Check if host mount exists and is accessible
			if _, err := os.Stat(mount + "/proc"); err == nil {
				basePaths["proc"] = append([]string{mount + "/proc"}, basePaths["proc"]...)
			}
			if _, err := os.Stat(mount + "/sys"); err == nil {
				basePaths["sys"] = append([]string{mount + "/sys"}, basePaths["sys"]...)
			}
			if _, err := os.Stat(mount + "/etc"); err == nil {
				basePaths["etc"] = append([]string{mount + "/etc"}, basePaths["etc"]...)
			}
		}
	}
	
	s.info.ProcPaths = basePaths["proc"]
	s.info.SysPaths = basePaths["sys"]
	s.info.EtcPaths = basePaths["etc"]
	
	// Setup thermal sensor paths based on platform
	s.setupThermalPaths()
}

// setupThermalPaths discovers available thermal sensor paths
func (s *PlatformService) setupThermalPaths() {
	var thermalPaths []string
	
	// Check common thermal zones
	for _, sysPath := range s.info.SysPaths {
		// Check thermal zones 0-9
		for i := 0; i <= 9; i++ {
			path := fmt.Sprintf("%s/class/thermal/thermal_zone%d/temp", sysPath, i)
			if _, err := os.Stat(path); err == nil {
				thermalPaths = append(thermalPaths, path)
			}
		}
		
		// Check hwmon sensors
		hwmonPath := sysPath + "/class/hwmon"
		if entries, err := os.ReadDir(hwmonPath); err == nil {
			for _, entry := range entries {
				if entry.IsDir() {
					// Check for temperature inputs
					hwmonDir := hwmonPath + "/" + entry.Name()
					if tempFiles, err := os.ReadDir(hwmonDir); err == nil {
						for _, tempFile := range tempFiles {
							if strings.HasPrefix(tempFile.Name(), "temp") && strings.HasSuffix(tempFile.Name(), "_input") {
								thermalPaths = append(thermalPaths, hwmonDir+"/"+tempFile.Name())
							}
						}
					}
				}
			}
		}
	}
	
	s.info.ThermalPaths = thermalPaths
}

// ResolvePath finds the first existing path from a list of candidates
func (s *PlatformService) ResolvePath(pathType string, relativePath string) string {
	var basePaths []string
	
	switch pathType {
	case "proc":
		basePaths = s.info.ProcPaths
	case "sys":
		basePaths = s.info.SysPaths
	case "etc":
		basePaths = s.info.EtcPaths
	default:
		return relativePath // Return as-is if unknown type
	}
	
	for _, base := range basePaths {
		fullPath := base + "/" + strings.TrimPrefix(relativePath, "/")
		if _, err := os.Stat(fullPath); err == nil {
			return fullPath
		}
	}
	
	return "" // No valid path found
}

// GetBestThermalPath returns the most suitable thermal sensor path
func (s *PlatformService) GetBestThermalPath() string {
	if len(s.info.ThermalPaths) == 0 {
		return ""
	}
	
	// Prefer thermal_zone0 if available
	for _, path := range s.info.ThermalPaths {
		if strings.Contains(path, "thermal_zone0") {
			return path
		}
	}
	
	// Return first available thermal path
	return s.info.ThermalPaths[0]
}