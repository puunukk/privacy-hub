import { Component } from 'react'
import { Router, ExternalLink } from 'lucide-react'
import type { RealNetworkInfo } from '@/utils/network'

interface DnsSetupGuideProps {
  networkInfo: RealNetworkInfo
}

export class DnsSetupGuide extends Component<DnsSetupGuideProps> {
  render() {
    const { networkInfo } = this.props
    const isDnsConfigured = networkInfo.dnsServers.includes(networkInfo.hostIP)

    if (isDnsConfigured) {
      return null
    }

    return (
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <Router className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                🏠 Home Network DNS Setup Guide
              </h4>
              <a
                href={`http://${networkInfo.gateway}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors"
              >
                <Router className="w-4 h-4" />
                <span>Open Router Admin</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p><strong>Step 1:</strong> Click "Open Router Admin" above or go to: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded font-mono">{networkInfo.gateway}</code></p>
              <p><strong>Step 2:</strong> Login to your router (check router label for default credentials)</p>
              <p><strong>Step 3:</strong> Find DHCP/DNS settings (usually under Network, LAN, or Internet)</p>
              <p><strong>Step 4:</strong> Set Primary DNS: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded font-mono">{networkInfo.hostIP}</code></p>
              <p><strong>Step 5:</strong> Set Secondary DNS: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded font-mono">{networkInfo.gateway}</code> (backup)</p>
              <p><strong>Step 6:</strong> Save settings and restart router if required</p>
              <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-800 rounded">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  💡 Pro Tip: After setup, all devices on your network will automatically use Pi-hole for ad-blocking and DNS filtering!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}