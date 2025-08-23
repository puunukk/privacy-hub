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
	fmt.Printf("DEBUG: GetNetworkInfo called\n")
	info := models.NetworkInfo{}
	
	platformInfo := s.platform.GetPlatformInfo()
	fmt.Printf("DEBUG: Platform detection - IsContainer: %t\n", platformInfo.IsContainer)
	
	// If running in container, try to get host IP through various methods
	if platformInfo.IsContainer {
		fmt.Printf("DEBUG: Using container network detection\n")
		info = s.getHostNetworkInfo()
	} else {
		fmt.Printf("DEBUG: Using local network detection\n")
		info = s.getLocalNetworkInfo()
	}
	
	// Get DNS using platform detection
	fmt.Printf("DEBUG: Getting DNS info\n")
	info.DNS = s.getDNS()
	
	fmt.Printf("DEBUG: NetworkInfo result - IP: '%s', Gateway: '%s', DNS: '%s'\n", info.IP, info.Gateway, info.DNS)
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
	
	// Primary method: Read directly from host's routing table via mounted filesystem
	if gateway, hostIP := s.getHostNetworkFromRouting(); gateway != "" || hostIP != "" {
		info.Gateway = gateway
		info.IP = hostIP
	}
	
	// Fallback method 1: Try to get host IP from Docker bridge network
	if info.IP == "" {
		if hostIP := s.getHostIPFromDocker(); hostIP != "" {
			info.IP = hostIP
		}
	}
	
	// Fallback method 2: Try alternative host network detection
	if info.Gateway == "" {
		if gateway := s.getHostGatewayFallback(); gateway != "" {
			info.Gateway = gateway
		}
	}
	
	return info
}

// getHostNetworkFromRouting reads host network info directly from mounted host routing table
func (s *NetworkService) getHostNetworkFromRouting() (gateway string, hostIP string) {
	// Read host's routing table from mounted filesystem
	hostRoutePath := s.platform.ResolvePath("proc", "net/route")
	if hostRoutePath == "" {
		fmt.Printf("DEBUG: Could not resolve host route path\n")
		return "", ""
	}
	
	fmt.Printf("DEBUG: Reading host routing from: %s\n", hostRoutePath)
	data, err := utils.ReadFile(hostRoutePath)
	if err != nil {
		fmt.Printf("DEBUG: Error reading host route file: %v\n", err)
		return "", ""
	}
	
	fmt.Printf("DEBUG: Host route data length: %d bytes\n", len(data))
	
	lines := strings.Split(data, "\n")
	if len(lines) < 2 {
		return "", ""
	}
	
	// Skip header line, process routing entries
	for i := 1; i < len(lines); i++ {
		line := strings.TrimSpace(lines[i])
		if line == "" {
			continue
		}
		
		fields := strings.Fields(line)
		if len(fields) < 8 {
			continue
		}
		
		// Field layout: Iface Destination Gateway Flags RefCnt Use Metric Mask MTU Window IRTT
		destination := fields[1]
		gatewayHex := fields[2]
		// flags := fields[3] // Not used currently
		
		// Look for default route (destination 00000000)
		if destination == "00000000" && gatewayHex != "00000000" {
			gateway = s.hexToIP(gatewayHex)
			fmt.Printf("DEBUG: Found default route - Gateway hex: %s -> IP: %s\n", gatewayHex, gateway)
			
			// Try to find the host IP by looking at the interface for this route
			iface := fields[0]
			fmt.Printf("DEBUG: Default route interface: %s\n", iface)
			if srcIP := s.getHostIPForInterfaceFromRouting(iface, lines); srcIP != "" {
				hostIP = srcIP
				fmt.Printf("DEBUG: Found host IP from routing: %s\n", hostIP)
			}
			break
		}
	}
	
	// If we didn't find host IP from routing table, try alternative methods
	if hostIP == "" && gateway != "" {
		// Method 1: Try to get from ARP table 
		if ip := s.getHostIPFromGatewaySubnet(gateway); ip != "" {
			hostIP = ip
		}
	}
	
	// Method 2: Try to get from host network interfaces via /proc/net/fib_trie (more reliable)
	if hostIP == "" {
		fmt.Printf("DEBUG: Trying to get IP from fib_trie\n")
		if ip := s.getHostIPFromFibTrie(); ip != "" {
			hostIP = ip
			fmt.Printf("DEBUG: Found host IP from fib_trie: %s\n", hostIP)
		}
	}
	
	fmt.Printf("DEBUG: Final network result - Gateway: %s, IP: %s\n", gateway, hostIP)
	return gateway, hostIP
}

// getHostIPForInterfaceFromRouting finds the host IP for a specific interface from routing table
func (s *NetworkService) getHostIPForInterfaceFromRouting(targetIface string, routeLines []string) string {
	// Look for a non-default route on the same interface to get the source IP
	for i := 1; i < len(routeLines); i++ {
		line := strings.TrimSpace(routeLines[i])
		if line == "" {
			continue
		}
		
		fields := strings.Fields(line)
		if len(fields) < 8 {
			continue
		}
		
		iface := fields[0]
		destination := fields[1]
		gateway := fields[2]
		
		// Same interface, not default route, and has a source (gateway field can be source for directly connected networks)
		if iface == targetIface && destination != "00000000" && gateway != "00000000" {
			// For directly connected networks, the gateway field might actually be the source IP
			return s.hexToIP(gateway)
		}
	}
	
	return ""
}

// getHostIPFromGatewaySubnet tries to determine host IP from gateway's subnet using ARP or neighbor info
func (s *NetworkService) getHostIPFromGatewaySubnet(gateway string) string {
	// Try to read ARP table from host to find our IP in the same subnet as gateway
	hostArpPath := s.platform.ResolvePath("proc", "net/arp")
	if hostArpPath == "" {
		return ""
	}
	
	data, err := utils.ReadFile(hostArpPath)
	if err != nil {
		return ""
	}
	
	// Parse gateway to get subnet (assuming /24 for simplicity)
	gatewayParts := strings.Split(gateway, ".")
	if len(gatewayParts) != 4 {
		return ""
	}
	subnet := fmt.Sprintf("%s.%s.%s.", gatewayParts[0], gatewayParts[1], gatewayParts[2])
	
	// Look for IPs in the same subnet in ARP table
	lines := strings.Split(data, "\n")
	for _, line := range lines {
		fields := strings.Fields(line)
		if len(fields) >= 1 {
			ip := fields[0]
			if strings.HasPrefix(ip, subnet) && ip != gateway {
				// This could be our host IP - let's validate it's not a reserved address
				lastOctet := strings.Split(ip, ".")[3]
				if lastOctet != "1" && lastOctet != "255" && lastOctet != "0" {
					return ip
				}
			}
		}
	}
	
	return ""
}

// getHostIPFromFibTrie reads host IP addresses from /proc/net/fib_trie
func (s *NetworkService) getHostIPFromFibTrie() string {
	// Try to read from host's fib_trie which shows all local IPs
	hostFibPath := s.platform.ResolvePath("proc", "net/fib_trie")
	if hostFibPath == "" {
		return ""
	}
	
	data, err := utils.ReadFile(hostFibPath)
	if err != nil {
		return ""
	}
	
	lines := strings.Split(data, "\n")
	var candidateIPs []string
	
	for _, line := range lines {
		// Look for host entries that show local IP addresses
		if strings.Contains(line, "/32 host LOCAL") {
			// Extract IP from the line format: "      |-- 192.168.1.100/32 host LOCAL"
			if idx := strings.Index(line, "|--"); idx != -1 {
				ipPart := strings.TrimSpace(line[idx+3:])
				if idx2 := strings.Index(ipPart, "/32"); idx2 != -1 {
					ip := ipPart[:idx2]
					
					// Filter out loopback and other special addresses
					if !strings.HasPrefix(ip, "127.") && 
					   !strings.HasPrefix(ip, "169.254.") &&
					   ip != "0.0.0.0" {
						candidateIPs = append(candidateIPs, ip)
					}
				}
			}
		}
	}
	
	// Prefer private network ranges (192.168.x.x, 10.x.x.x) over public IPs
	for _, ip := range candidateIPs {
		if strings.HasPrefix(ip, "192.168.") || strings.HasPrefix(ip, "10.") {
			return ip
		}
	}
	
	// If no private IP found, return first valid candidate
	if len(candidateIPs) > 0 {
		return candidateIPs[0]
	}
	
	return ""
}

// getHostGatewayFallback is the original getHostGateway method as fallback
func (s *NetworkService) getHostGatewayFallback() string {
	// Method 1: Use ip route command directly
	output, err := exec.Command("sh", "-c", "ip route show default | awk '/default/ {print $3}'").Output()
	if err == nil {
		gateway := strings.TrimSpace(string(output))
		if gateway != "" && !strings.HasPrefix(gateway, "172.") {
			return gateway
		}
	}
	
	return ""
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
					// Try to get host IP from gateway subnet using ARP table
					gateway := fields[i+1]
					if hostIP := s.getHostIPFromGatewaySubnet(gateway); hostIP != "" {
						return hostIP
					}
				}
			}
		}
	}
	
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