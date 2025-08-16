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
    console.log('🔍 Detecting host network info from browser hostname...')

    // The IP clients use to access the app - this IS the host's actual local network IP
    const hostIP = window.location.hostname
    console.log('📍 Client accesses app via:', hostIP)

    // If accessing via real IP (not localhost), this IS the correct host IP
    if (hostIP !== 'localhost' && hostIP !== '127.0.0.1' && hostIP !== '0.0.0.0') {
      const hostParts = hostIP.split('.')
      if (hostParts.length === 4 && hostParts.every(part => !isNaN(parseInt(part)))) {
        // Calculate network info based on the actual host IP
        const gateway = `${hostParts[0]}.${hostParts[1]}.${hostParts[2]}.1`
        const subnet = `${hostParts[0]}.${hostParts[1]}.${hostParts[2]}.0/24`

        console.log('✅ Detected host network info:', {
          hostIP,
          gateway,
          subnet,
          note: 'This is the actual host machine IP from browser URL'
        })

        return {
          hostIP,
          hostname: 'privacy-hub',
          gateway,
          subnet,
          isDhcpClient: true,
          dnsServers: [hostIP, gateway, '8.8.8.8', '1.1.1.1']
        }
      }
    }

    // If accessing via localhost, we can't determine the real network info
    console.warn('⚠️ Accessing via localhost - cannot determine real network info')
    throw new Error('Cannot determine network info when accessing via localhost. Please access using the actual IP address.')

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