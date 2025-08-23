import { PureComponent, type ReactNode } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Network, AlertCircle, CheckCircle, Router, ChevronDown, ChevronRight, Globe } from 'lucide-react'

import { cn } from '@/utils/cn'
import type { RootState } from '@/store'
import { Typography } from '@/components/ui/Typography'

const mapStateToProps = (state: RootState) => ({
  networkInfo: state.systemInfo.data ? {
    hostIP: state.systemInfo.data.ip || 'unknown',
    hostname: state.systemInfo.data.hostname || 'privacy-hub',
    gateway: state.systemInfo.data.gateway || '192.168.1.1',
    subnet: '192.168.1.0/24',
    isDhcpClient: true,
    dnsServers: [state.systemInfo.data.dns || '8.8.8.8', '1.1.1.1']
  } : null,
})

const connector = connect(mapStateToProps)
type NetworkSetupCardProps = ConnectedProps<typeof connector>

interface NetworkSetupCardState {
  expandedSections: {
    dns: boolean
    setup: boolean
  }
}

class NetworkSetupCard extends PureComponent<NetworkSetupCardProps, NetworkSetupCardState> {
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
    status?: 'success' | 'warning' | 'error'
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
      <div className="px-4 pb-4">
        {/* DNS Status Card */}
        <div className={cn(
          "p-4 rounded-lg mb-4",
          isDnsConfigured
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
        )}>
          <div className="flex items-center space-x-3 mb-3">
            {isDnsConfigured ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            )}
            <Typography.Text size="sm" weight="medium" color="primary">
              {isDnsConfigured ? 'Pi-hole DNS Active' : 'Pi-hole DNS Not Configured'}
            </Typography.Text>
          </div>
          {isDnsConfigured ? (
            <p className="text-sm text-green-800 dark:text-green-200">
              All devices on your network are using Pi-hole for ad-blocking and DNS filtering.
            </p>
          ) : (
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Configure your router to use Pi-hole as the DNS server for network-wide ad-blocking.
            </p>
          )}
        </div>

        {/* DNS Configuration Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Typography.Text size="sm" color="muted">Primary DNS:</Typography.Text>
            <Typography.Text size="sm" weight="medium" color="primary">{networkInfo.dnsServers[0] || 'Not set'}</Typography.Text>
          </div>
          {networkInfo.dnsServers[1] && (
            <div className="flex justify-between items-center">
              <Typography.Text size="sm" color="muted">Secondary DNS:</Typography.Text>
              <Typography.Text size="sm" weight="medium" color="primary">{networkInfo.dnsServers[1]}</Typography.Text>
            </div>
          )}
          <div className="flex justify-between items-center">
            <Typography.Text size="sm" color="muted">Pi-hole IP:</Typography.Text>
            <Typography.Text size="sm" weight="medium" color="primary">{networkInfo.hostIP}</Typography.Text>
          </div>
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
            <Typography.Text size="lg" weight="semibold" color="primary">
              Network Configuration</Typography.Text>
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

export default connector(NetworkSetupCard)
