import { PureComponent, type ReactNode } from 'react'
import { Network, AlertCircle, CheckCircle, Router, ChevronDown, ChevronRight, Globe, Shield } from 'lucide-react'
import type { RealNetworkInfo } from '../utils/network'
import { cn } from '@/utils/cn'

interface NetworkSetupCardProps {
  networkInfo?: RealNetworkInfo | null
}

interface NetworkSetupCardState {
  expandedSections: {
    dns: boolean
    setup: boolean
  }
}

export class NetworkSetupCard extends PureComponent<NetworkSetupCardProps, NetworkSetupCardState> {
  constructor(props: NetworkSetupCardProps) {
    super(props)
    this.state = {
      expandedSections: {
        dns: true,
        setup: false
      }
    }
  }

  toggleSection = (section: keyof NetworkSetupCardState['expandedSections']) => {
    this.setState(prevState => ({
      expandedSections: {
        ...prevState.expandedSections,
        [section]: !prevState.expandedSections[section]
      }
    }))
  }

  renderSectionHeader = (
    title: string,
    icon: ReactNode,
    section: keyof NetworkSetupCardState['expandedSections'],
    status?: 'success' | 'warning' | 'error',
    count?: number
  ) => {
    const isExpanded = this.state.expandedSections[section]

    const getStatusIcon = () => {
      switch (status) {
        case 'success':
          return <CheckCircle className="w-4 h-4 text-green-500" />
        case 'warning':
          return <AlertCircle className="w-4 h-4 text-yellow-500" />
        case 'error':
          return <AlertCircle className="w-4 h-4 text-red-500" />
        default:
          return null
      }
    }

    return (
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => this.toggleSection(section)}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
          {getStatusIcon()}
          {count !== undefined && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </div>
    )
  }

  renderDnsInfo = () => {
    const { networkInfo } = this.props
    const isExpanded = this.state.expandedSections.dns

    if (!isExpanded || !networkInfo) return null

    const isDnsConfigured = networkInfo.dnsServers.includes(networkInfo.hostIP) || false

    return (
      <div className="px-4 pb-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Primary DNS:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{networkInfo.dnsServers[0] || 'Not set'}</span>
        </div>
        {networkInfo.dnsServers[1] && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Secondary DNS:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{networkInfo.dnsServers[1]}</span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            {isDnsConfigured ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pi-hole DNS Status
            </span>
          </div>
          {isDnsConfigured ? (
            <p className="text-sm text-green-600 dark:text-green-400">✓ Pi-hole is configured as DNS server</p>
          ) : (
            <div className="text-sm text-yellow-600 dark:text-yellow-400">
              <p>⚠ Configure router to use Pi-hole DNS:</p>
              <p className="font-mono mt-1">Primary DNS: {networkInfo.hostIP}</p>
              <p className="font-mono">Secondary DNS: {networkInfo.gateway}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  renderSetupGuide = () => {
    const { networkInfo } = this.props
    const isExpanded = this.state.expandedSections.setup

    if (!isExpanded || !networkInfo) return null

    const isDnsConfigured = networkInfo.dnsServers.includes(networkInfo.hostIP) || false

    if (isDnsConfigured) {
      return (
        <div className="px-4 pb-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                  ✓ Network Setup Complete
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your network is properly configured with Pi-hole DNS. All devices on your network
                  are now using Pi-hole for ad-blocking and DNS filtering.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="px-4 pb-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <Router className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🏠 Home Network DNS Setup Guide
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p><strong>Step 1:</strong> Access your router admin panel: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">http://{networkInfo.gateway}</code></p>
                <p><strong>Step 2:</strong> Find DHCP/DNS settings (usually under Network or LAN)</p>
                <p><strong>Step 3:</strong> Set Primary DNS: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{networkInfo.hostIP}</code></p>
                <p><strong>Step 4:</strong> Set Secondary DNS: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{networkInfo.gateway}</code> (backup)</p>
                <p><strong>Step 5:</strong> Save settings and restart router</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  💡 All devices on your network will now use Pi-hole for ad-blocking and DNS filtering!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { networkInfo } = this.props

    if (!networkInfo) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Network className="w-5 h-5" />
              <span>Network Configuration</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Loading network information...
            </div>
          </div>
        </div>
      )
    }

    const isDnsConfigured = networkInfo.dnsServers.includes(networkInfo.hostIP) || false

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Network className="w-5 h-5" />
            <span>Network Configuration</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* DNS Configuration Section */}
          <div>
            {this.renderSectionHeader(
              'DNS Configuration',
              <Globe className="w-4 h-4" />,
              'dns',
              isDnsConfigured ? 'success' : 'warning'
            )}
            {this.renderDnsInfo()}
          </div>

          {/* Setup Guide Section */}
          <div>
            {this.renderSectionHeader(
              'Setup Guide',
              <Router className="w-4 h-4" />,
              'setup',
              isDnsConfigured ? 'success' : 'warning'
            )}
            {this.renderSetupGuide()}
          </div>
        </div>
      </div>
    )
  }
}
