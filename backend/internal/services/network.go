package services

import (
	"fmt"
	"os/exec"
	"strings"

	"privacy-hub-backend/internal/models"
	"privacy-hub-backend/internal/utils"
)

// NetworkService handles network information retrieval
type NetworkService struct {
	platform *PlatformService
}

// NewNetworkService creates a new network service instance
func NewNetworkService() *NetworkService {
	return &NetworkService{
		platform: NewPlatformService(),
	}
}

// GetNetworkInfo extracts IP and gateway from routing table
func (s *NetworkService) GetNetworkInfo() models.NetworkInfo {
	info := models.NetworkInfo{}
	
	// If running in container, try to get host IP through various methods
	if s.platform.GetPlatformInfo().IsContainer {
		info = s.getHostNetworkInfo()
	} else {
		info = s.getLocalNetworkInfo()
	}
	
	// Get DNS using platform detection
	info.DNS = s.getDNS()
	
	return info
}

// getLocalNetworkInfo gets network info when running directly on host
func (s *NetworkService) getLocalNetworkInfo() models.NetworkInfo {
	info := models.NetworkInfo{}
	
	// Execute single command to get routing info
	output, err := exec.Command("ip", "route").Output()
	if err != nil {
		return info
	}
	
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		fields := strings.Fields(line)
		if len(fields) < 3 || fields[0] != "default" {
			continue
		}
		
		// Parse default route: "default via 192.168.1.1 dev eth0 src 192.168.1.100"
		for i, field := range fields {
			if field == "via" && i+1 < len(fields) {
				info.Gateway = fields[i+1]
			}
			if field == "src" && i+1 < len(fields) {
				info.IP = fields[i+1]
			}
		}
		break // Only need first default route
	}
	
	return info
}

// getHostNetworkInfo gets network info when running in container
func (s *NetworkService) getHostNetworkInfo() models.NetworkInfo {
	info := models.NetworkInfo{}
	
	// Method 1: Try to get host IP from Docker bridge network
	if hostIP := s.getHostIPFromDocker(); hostIP != "" {
		info.IP = hostIP
	}
	
	// Method 2: Try to get gateway from host routing
	if gateway := s.getHostGateway(); gateway != "" {
		info.Gateway = gateway
	}
	
	// Method 3: If still no IP, try to get it from host network interfaces
	if info.IP == "" {
		if hostIP := s.getHostIPFromInterfaces(); hostIP != "" {
			info.IP = hostIP
		}
	}
	
	return info
}

// getHostIPFromDocker tries to get host IP from Docker bridge network
func (s *NetworkService) getHostIPFromDocker() string {
	// Try to get host IP from Docker bridge gateway
	output, err := exec.Command("ip", "route", "show", "default").Output()
	if err != nil {
		return ""
	}
	
	// Look for Docker bridge gateway (usually 172.17.0.1 or similar)
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "via") && strings.Contains(line, "172.") {
			fields := strings.Fields(line)
			for i, field := range fields {
				if field == "via" && i+1 < len(fields) {
					// This is likely the Docker bridge gateway
					// The host IP is usually the same subnet
					gateway := fields[i+1]
					// Extract subnet and try to find host IP
					if hostIP := s.findHostIPInSubnet(gateway); hostIP != "" {
						return hostIP
					}
				}
			}
		}
	}
	
	return ""
}

// getHostGateway gets the host's default gateway
func (s *NetworkService) getHostGateway() string {
	// When running in host network mode, we can directly access host routing
	// Method 1: Get from host's routing table directly
	hostRoutePath := s.platform.ResolvePath("proc", "net/route")
	if hostRoutePath != "" {
		if data, err := utils.ReadFile(hostRoutePath); err == nil {
			lines := strings.Split(data, "\n")
			for _, line := range lines {
				fields := strings.Fields(line)
				if len(fields) >= 2 && fields[1] == "00000000" { // Default route
					if len(fields) >= 3 {
						// Convert hex gateway to IP
						return s.hexToIP(fields[2])
					}
				}
			}
		}
	}
	
	// Method 2: Use ip route command directly
	output, err := exec.Command("sh", "-c", "ip route show default | awk '/default/ {print $3}'").Output()
	if err == nil {
		gateway := strings.TrimSpace(string(output))
		if gateway != "" && !strings.HasPrefix(gateway, "172.") {
			return gateway
		}
	}
	
	return ""
}

// getHostIPFromInterfaces tries to get host IP from network interfaces
func (s *NetworkService) getHostIPFromInterfaces() string {
	// When running in host network mode, we can directly access host network info
	// Try multiple methods to get the actual host IP
	
	// Method 1: Get the IP that would be used to reach external networks
	output, err := exec.Command("sh", "-c", "ip route get 8.8.8.8 2>/dev/null | grep -oP 'src \\K\\S+'").Output()
	if err == nil {
		ip := strings.TrimSpace(string(output))
		if ip != "" && !strings.HasPrefix(ip, "172.") && !strings.HasPrefix(ip, "10.") {
			return ip
		}
	}
	
	// Method 2: Get from host's network interfaces - look for the main interface
	output, err = exec.Command("sh", "-c", "ip addr show | grep -E 'inet .* global' | grep -v '172.' | grep -v '10.' | head -1 | awk '{print $2}' | cut -d'/' -f1").Output()
	if err == nil {
		ip := strings.TrimSpace(string(output))
		if ip != "" {
			return ip
		}
	}
	
	// Method 3: Try to get from host's routing table directly
	hostRoutePath := s.platform.ResolvePath("proc", "net/route")
	if hostRoutePath != "" {
		if data, err := utils.ReadFile(hostRoutePath); err == nil {
			lines := strings.Split(data, "\n")
			for _, line := range lines {
				fields := strings.Fields(line)
				if len(fields) >= 2 && fields[1] == "00000000" { // Default route
					if len(fields) >= 4 {
						// The source IP is in field 7 (0-indexed)
						if len(fields) >= 7 {
							return s.hexToIP(fields[6])
						}
					}
				}
			}
		}
	}
	
	return ""
}

// findHostIPInSubnet tries to find the host IP in the same subnet as the gateway
func (s *NetworkService) findHostIPInSubnet(gateway string) string {
	// This is a simplified implementation
	// In practice, you might want to scan the subnet or use other methods
	// For now, let's try to get it from the host's network configuration
	
	// Try to get from host's network interfaces
	hostNetPath := s.platform.ResolvePath("proc", "net/dev")
	if hostNetPath == "" {
		return ""
	}
	
	// This is a placeholder - you'd need to implement proper subnet scanning
	// For now, return empty and let other methods handle it
	return ""
}

// hexToIP converts hex IP to dotted decimal
func (s *NetworkService) hexToIP(hex string) string {
	if len(hex) != 8 {
		return ""
	}
	
	// Convert little-endian hex to IP
	ip := ""
	for i := 6; i >= 0; i -= 2 {
		if i > 0 {
			ip += s.hexToDec(hex[i:i+2]) + "."
		} else {
			ip += s.hexToDec(hex[i:i+2])
		}
	}
	
	return ip
}

// hexToDec converts hex to decimal
func (s *NetworkService) hexToDec(hex string) string {
	// Simple hex to decimal conversion
	var result int
	for _, char := range hex {
		digit := 0
		if char >= '0' && char <= '9' {
			digit = int(char - '0')
		} else if char >= 'a' && char <= 'f' {
			digit = int(char - 'a' + 10)
		} else if char >= 'A' && char <= 'F' {
			digit = int(char - 'A' + 10)
		}
		result = result*16 + digit
	}
	return fmt.Sprintf("%d", result)
}

// getDNS reads primary DNS server from resolv.conf using platform detection
func (s *NetworkService) getDNS() string {
	resolvPath := s.platform.ResolvePath("etc", "resolv.conf")
	if resolvPath == "" {
		return ""
	}
	
	if data, err := utils.ReadFile(resolvPath); err == nil {
		lines := strings.Split(data, "\n")
		for _, line := range lines {
			if strings.HasPrefix(line, "nameserver") {
				fields := strings.Fields(line)
				if len(fields) >= 2 {
					return fields[1] // Return first DNS server
				}
			}
		}
	}
	
	return ""
}