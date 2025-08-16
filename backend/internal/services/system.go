package services

import (
	"strconv"
	"strings"

	"privacy-hub-backend/internal/models"
	"privacy-hub-backend/internal/utils"
)

// SystemService handles system information retrieval
type SystemService struct {
	platform *PlatformService
}

// NewSystemService creates a new system service instance
func NewSystemService() *SystemService {
	return &SystemService{
		platform: NewPlatformService(),
	}
}

// GetCPUTemp reads CPU temperature using intelligent path detection
func (s *SystemService) GetCPUTemp() float64 {
	// Use platform service to find best thermal path
	thermalPath := s.platform.GetBestThermalPath()
	if thermalPath == "" {
		return 0 // No thermal sensors found
	}
	
	if data, err := utils.ReadFile(thermalPath); err == nil {
		if temp, err := strconv.ParseFloat(data, 64); err == nil {
			// Handle different sensor types
			if strings.Contains(thermalPath, "hwmon") {
				return temp / 1000.0 // hwmon sensors usually in millidegrees
			}
			return temp / 1000.0 // thermal_zone sensors in millidegrees
		}
	}
	
	return 0
}

// GetMemoryInfo parses /proc/meminfo using platform detection
func (s *SystemService) GetMemoryInfo() models.MemoryInfo {
	meminfoPath := s.platform.ResolvePath("proc", "meminfo")
	if meminfoPath == "" {
		return models.MemoryInfo{}
	}
	
	if data, err := utils.ReadFile(meminfoPath); err == nil {
		return s.parseMemInfo(data)
	}
	
	return models.MemoryInfo{}
}

// parseMemInfo extracts memory stats from /proc/meminfo content
func (s *SystemService) parseMemInfo(data string) models.MemoryInfo {
	info := models.MemoryInfo{}
	lines := strings.Split(data, "\n")
	
	for _, line := range lines {
		fields := strings.Fields(line)
		if len(fields) < 2 {
			continue
		}
		
		value, err := strconv.ParseInt(fields[1], 10, 64)
		if err != nil {
			continue
		}
		
		switch fields[0] {
		case "MemTotal:":
			info.Total = value
		case "MemAvailable:":
			info.Free = value
		}
		
		// Break early if we have both values
		if info.Total > 0 && info.Free > 0 {
			break
		}
	}
	
	info.Used = info.Total - info.Free
	return info
}

// GetLoadAvg reads system load averages using platform detection
func (s *SystemService) GetLoadAvg() string {
	loadavgPath := s.platform.ResolvePath("proc", "loadavg")
	if loadavgPath == "" {
		return ""
	}
	
	if data, err := utils.ReadFile(loadavgPath); err == nil {
		fields := strings.Fields(data)
		if len(fields) >= 3 {
			return strings.Join(fields[:3], " ")
		}
	}
	
	return ""
}

// GetHostname reads system hostname using platform detection
func (s *SystemService) GetHostname() string {
	hostnamePath := s.platform.ResolvePath("etc", "hostname")
	if hostnamePath == "" {
		return ""
	}
	
	if hostname, err := utils.ReadFile(hostnamePath); err == nil {
		return hostname
	}
	
	return ""
}

// GetUptime reads system uptime using platform detection
func (s *SystemService) GetUptime() string {
	uptimePath := s.platform.ResolvePath("proc", "uptime")
	if uptimePath == "" {
		return ""
	}
	
	if data, err := utils.ReadFile(uptimePath); err == nil {
		fields := strings.Fields(data)
		if len(fields) >= 1 {
			return fields[0]
		}
	}
	
	return ""
}

// GetPlatformInfo returns detected platform information for debugging
func (s *SystemService) GetPlatformInfo() *models.PlatformInfo {
	return s.platform.GetPlatformInfo()
}