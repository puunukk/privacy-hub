import { Component } from 'react'
import { Network, Router, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import type { RealNetworkInfo } from '@/utils/network'

interface NetworkSetupCardProps {
  networkInfo: RealNetworkInfo
}

export class NetworkSetupCard extends Component<NetworkSetupCardProps> {
  render() {
    const { networkInfo } = this.props
    const isDnsConfigured = networkInfo.dnsServers.includes(networkInfo.hostIP)

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center space-x-2">
          <Network className="w-4 h-4" />
          <span>Network Setup</span>
        </h3>
        <div className="space-y-3">
          {/* Router Gateway */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Router className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Router Gateway</span>
              </div>
              <a
                href={`http://${networkInfo.gateway}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
              >
                <span>Access Router</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700 dark:text-blue-300">Gateway IP:</span>
              <span className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">{networkInfo.gateway}</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Click "Access Router" to configure DNS settings
            </p>
          </div>

          {/* Network Details */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Host IP:</span>
            <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">{networkInfo.hostIP}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Subnet:</span>
            <span className="text-sm font-mono text-gray-900 dark:text-white">{networkInfo.subnet}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">DHCP Client:</span>
            <span className={`text-sm font-medium ${networkInfo.isDhcpClient ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {networkInfo.isDhcpClient ? 'Yes' : 'Static IP'}
            </span>
          </div>

          {/* DNS Status */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              {isDnsConfigured ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                DNS Status
              </span>
            </div>
            {isDnsConfigured ? (
              <p className="text-xs text-green-600 dark:text-green-400">✓ Pi-hole is configured as DNS server</p>
            ) : (
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                <p>⚠ Configure router to use Pi-hole DNS:</p>
                <p className="mt-1">Primary DNS: <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{networkInfo.hostIP}</span></p>
                <p>Secondary DNS: <span className="font-mono font-bold text-sm text-yellow-700 dark:text-yellow-300">{networkInfo.gateway}</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}