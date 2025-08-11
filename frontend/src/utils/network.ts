// Network utilities for getting real system information

export interface RealNetworkInfo {
  hostIP: string
  hostname: string
  gateway: string
  subnet: string
  isDhcpClient: boolean
  dnsServers: string[]
  macAddress?: string
}

export const detectRealNetworkInfo = async (): Promise<RealNetworkInfo> => {
  try {
    // Try to get real network info from Docker API or browser APIs
    
    // Get the current frontend container's network information
    const response = await fetch('/api/docker/containers/json?filters={"name":["frontend"]}')
    if (response.ok) {
      const containers = await response.json()
      if (containers.length > 0) {
        const frontend = containers[0]
        const networks = Object.values(frontend.NetworkSettings.Networks)[0] as any
        
        if (networks?.IPAddress) {
          // Extract network info from Docker container network
          // const containerIP = networks.IPAddress // Unused for now
          const gateway = networks.Gateway
          const subnet = `${gateway.split('.').slice(0, 3).join('.')}.0/24`
          
          // Try to determine host IP (usually gateway + some offset)
          const gatewayParts = gateway.split('.')
          const hostIP = `${gatewayParts[0]}.${gatewayParts[1]}.${gatewayParts[2]}.${parseInt(gatewayParts[3]) + 1}`
          
          return {
            hostIP,
            hostname: 'privacy-hub',
            gateway,
            subnet,
            isDhcpClient: true,
            dnsServers: [gateway, '8.8.8.8'],
            macAddress: 'detecting...'
          }
        }
      }
    }
    
    // Fallback: try to detect from browser location
    const currentHost = window.location.hostname
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      // User is accessing via actual IP
      const hostParts = currentHost.split('.')
      const gateway = `${hostParts[0]}.${hostParts[1]}.${hostParts[2]}.1`
      const subnet = `${hostParts[0]}.${hostParts[1]}.${hostParts[2]}.0/24`
      
      return {
        hostIP: currentHost,
        hostname: 'privacy-hub',
        gateway,
        subnet,
        isDhcpClient: true,
        dnsServers: [gateway, '8.8.8.8']
      }
    }
    
    // Last resort: reasonable defaults for development
    return {
      hostIP: '192.168.1.100',
      hostname: 'privacy-hub',
      gateway: '192.168.1.1',
      subnet: '192.168.1.0/24',
      isDhcpClient: true,
      dnsServers: ['192.168.1.1', '8.8.8.8']
    }
    
  } catch (error) {
    console.error('Failed to detect network info:', error)
    
    // Emergency fallback
    return {
      hostIP: 'detecting...',
      hostname: 'privacy-hub',
      gateway: 'detecting...',
      subnet: 'detecting...',
      isDhcpClient: true,
      dnsServers: ['detecting...']
    }
  }
}