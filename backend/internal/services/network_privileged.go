package services

import (
	"fmt"
	"log"
	"os/exec"
	"strings"
	"privacy-hub-backend/internal/models"
	"privacy-hub-backend/internal/utils"
)

// PrivilegedNetworkService - Uses nsenter to run commands on host namespace
type PrivilegedNetworkService struct {
	platform *PlatformService
}

func NewPrivilegedNetworkService() *PrivilegedNetworkService {
	return &PrivilegedNetworkService{
		platform: NewPlatformService(),
	}
}

// GetNetworkInfo - Use nsenter to run commands in host namespace
func (s *PrivilegedNetworkService) GetNetworkInfo() models.NetworkInfo {
	info := models.NetworkInfo{}
	
	// Basic info
	info.IsContainer = s.platform.GetPlatformInfo().IsContainer
	info.DNS = s.getDNS()
	info.Uptime = s.getUptime()
	
	// Use nsenter to run commands in host namespace
	info.Hostname, info.IP = s.getHostNetwork()
	info.Gateway = s.getHostGateway()
	
	// Container info (for debugging)
	if info.IsContainer {
		info.ContainerIP, info.ContainerGateway = s.getContainerNetwork()
	}
	
	return info
}

// getHostNetwork - Get host hostname and IP using nsenter
func (s *PrivilegedNetworkService) getHostNetwork() (hostname, ip string) {
	// Get host IP using nsenter with ip addr show
	cmd := exec.Command("nsenter", "-t", "1", "-n", 
		"ip", "addr", "show")
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("nsenter command failed: %v, output: %s", err, string(output))
		return s.getHostnameFromFile(), ""
	}
	
	// Parse ip addr show output to find inet addresses
	lines := strings.Split(string(output), "\n")
	
	// Get hostname from file
	hostname = s.getHostnameFromFile()
	
	// Find the host IP (192.168.x.x or 10.x.x.x)
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "inet ") {
			fields := strings.Fields(line)
			if len(fields) >= 2 {
				ipCidr := fields[1]
				if slashIdx := strings.Index(ipCidr, "/"); slashIdx > 0 {
					candidateIP := ipCidr[:slashIdx]
					// Skip loopback and find private network IP
					if !strings.HasPrefix(candidateIP, "127.") &&
					   (strings.HasPrefix(candidateIP, "192.168.") || strings.HasPrefix(candidateIP, "10.")) {
						ip = candidateIP
						break
					}
				}
			}
		}
	}
	
	return hostname, ip
}

// getHostGateway - Get gateway using nsenter
func (s *PrivilegedNetworkService) getHostGateway() string {
	cmd := exec.Command("nsenter", "-t", "1", "-n", 
		"ip", "route", "show", "default")
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("nsenter gateway command failed: %v, output: %s", err, string(output))
		return s.getFallbackGateway()
	}
	
	// Parse "default via 192.168.1.1 dev eth0"
	fields := strings.Fields(string(output))
	for i, field := range fields {
		if field == "via" && i+1 < len(fields) {
			return fields[i+1]
		}
	}
	
	return s.getFallbackGateway()
}

// getHostnameFromFile - Get hostname from file
func (s *PrivilegedNetworkService) getHostnameFromFile() string {
	if data, err := utils.ReadFile("/host/etc/hostname"); err == nil {
		return strings.TrimSpace(data)
	}
	return "unknown"
}


// getFallbackGateway - Fallback gateway detection
func (s *PrivilegedNetworkService) getFallbackGateway() string {
	// DNS is often the gateway
	dns := s.getDNS()
	if dns != "" && strings.HasSuffix(dns, ".1") {
		log.Printf("Using DNS as gateway fallback: %s", dns)
		return dns
	}
	return ""
}

// getDNS - Read DNS from resolv.conf
func (s *PrivilegedNetworkService) getDNS() string {
	paths := []string{"/host/etc/resolv.conf", "/etc/resolv.conf"}
	for _, path := range paths {
		if data, err := utils.ReadFile(path); err == nil {
			for _, line := range strings.Split(data, "\n") {
				if strings.HasPrefix(line, "nameserver") {
					fields := strings.Fields(line)
					if len(fields) >= 2 {
						return fields[1]
					}
				}
			}
		}
	}
	return ""
}

// getUptime - Read uptime
func (s *PrivilegedNetworkService) getUptime() string {
	paths := []string{"/host/proc/uptime", "/proc/uptime"}
	for _, path := range paths {
		if data, err := utils.ReadFile(path); err == nil {
			fields := strings.Fields(data)
			if len(fields) > 0 {
				return fields[0]
			}
		}
	}
	return "0"
}

// getContainerNetwork - Get container's own network info
func (s *PrivilegedNetworkService) getContainerNetwork() (ip, gateway string) {
	// Read container's route table
	if data, err := utils.ReadFile("/proc/net/route"); err == nil {
		lines := strings.Split(data, "\n")
		for i := 1; i < len(lines); i++ {
			fields := strings.Fields(lines[i])
			if len(fields) >= 8 && fields[1] == "00000000" {
				hex := fields[2]
				if len(hex) == 8 {
					gateway = fmt.Sprintf("%d.%d.%d.%d",
						hexToDec(hex[6:8]), hexToDec(hex[4:6]),
						hexToDec(hex[2:4]), hexToDec(hex[0:2]))
				}
			}
		}
	}
	
	// Try to get container IP
	if data, err := utils.ReadFile("/proc/net/fib_trie"); err == nil {
		for _, line := range strings.Split(data, "\n") {
			if strings.Contains(line, "172.") && strings.Contains(line, "LOCAL") {
				if idx := strings.Index(line, "|--"); idx != -1 {
					part := strings.TrimSpace(line[idx+3:])
					if slashIdx := strings.Index(part, "/32"); slashIdx > 0 {
						ip = strings.TrimSpace(part[:slashIdx])
						break
					}
				}
			}
		}
	}
	
	return ip, gateway
}

// hexToDec - convert hex to decimal
func hexToDec(hex string) int {
	val := 0
	for _, c := range hex {
		val *= 16
		if c >= '0' && c <= '9' {
			val += int(c - '0')
		} else if c >= 'a' && c <= 'f' {
			val += int(c - 'a' + 10)
		} else if c >= 'A' && c <= 'F' {
			val += int(c - 'A' + 10)
		}
	}
	return val
}