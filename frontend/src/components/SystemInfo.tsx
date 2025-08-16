import { Component, ReactNode } from 'react'
import { Server, Globe, Shield, Search, ExternalLink, Network, AlertCircle, CheckCircle, Router, X } from 'lucide-react'
import type { DockerInfo } from '../types/docker'
import type { RealNetworkInfo } from '../utils/network'
import { SearxngConfig } from './SearxngConfig'

interface SystemInfoProps {
  dockerInfo: DockerInfo | null
  networkInfo?: RealNetworkInfo | null
}

interface SystemInfoState {
  showSearxngConfig: boolean
}

export class SystemInfo extends Component<SystemInfoProps, SystemInfoState> {
  constructor(props: SystemInfoProps) {
    super(props)
    this.state = {
      showSearxngConfig: false
    }
  }

  openSearxngConfig = () => {
    this.setState({ showSearxngConfig: true })
  }

  closeSearxngConfig = () => {
    this.setState({ showSearxngConfig: false })
  }

  render() {
    const { dockerInfo, networkInfo } = this.props
    const { showSearxngConfig } = this.state
    const loading = !networkInfo

    const isDnsConfigured = networkInfo?.dnsServers.includes(networkInfo.hostIP) || false

    // Detect if we're in development or production  
    const isDevelopment = window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443'
    // In production, nginx handles all routing, so use relative paths
    const baseUrl = isDevelopment ? `${window.location.protocol}//localhost:${window.location.port}` : ''

    const quickLinks: Array<{
      name: string
      url: string
      icon: ReactNode
      color: string
      onClick?: () => void
    }> = [
        {
          name: 'Pi-hole Admin',
          url: `${baseUrl}/admin`,
          icon: <Shield className="w-4 h-4" />,
          color: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
        },
        {
          name: 'SearXNG Search',
          url: `${baseUrl}/`,
          icon: <Search className="w-4 h-4" />,
          color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
        },
        {
          name: 'System Dashboard',
          url: isDevelopment ? `${window.location.protocol}//localhost:${window.location.port}/` : '/dashboard/',
          icon: <Server className="w-4 h-4" />,
          color: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800'
        },
        {
          name: '🔧 Configure SearXNG',
          url: '#',
          icon: <Globe className="w-4 h-4" />,
          color: 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800',
          onClick: this.openSearxngConfig
        }
      ]

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8 transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>System Overview</span>
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-gray-500 dark:text-gray-400">
                Loading network information...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

              {/* System Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  System Info
                </h3>
                <div className="space-y-3">
                  {networkInfo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Hostname:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{networkInfo.hostname}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Host IP:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{networkInfo.hostIP}</span>
                      </div>
                      {networkInfo.macAddress && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">MAC Address:</span>
                          <span className="text-sm font-mono text-gray-900 dark:text-white">{networkInfo.macAddress}</span>
                        </div>
                      )}
                    </>
                  )}
                  {dockerInfo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Docker Version:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.ServerVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">OS:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.OperatingSystem}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Architecture:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.Architecture}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Resource Summary */}
              {dockerInfo && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Resources
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">CPU Cores:</span>
                      <span className="text-sm font-medium text-gray-900">{dockerInfo.NCPU}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Memory:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round(dockerInfo.MemTotal / 1024 / 1024 / 1024)} GB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Images:</span>
                      <span className="text-sm font-medium text-gray-900">{dockerInfo.Images}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Running Containers:</span>
                      <span className="text-sm font-medium text-green-600">{dockerInfo.ContainersRunning}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Stopped Containers:</span>
                      <span className="text-sm font-medium text-gray-500">{dockerInfo.ContainersStopped}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Network Configuration */}
              {networkInfo && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                    <Network className="w-4 h-4" />
                    <span>Network Setup</span>
                  </h3>
                  <div className="space-y-3">
                    {/* Prominent Gateway Display with Router Access */}
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
                        <span className="text-sm text-blue-700 dark:text-blue-300">Gateway IP:</span>
                        <span className="text-sm font-mono font-semibold text-blue-900 dark:text-blue-100">{networkInfo.gateway}</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Click "Access Router" to configure DNS settings
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Host IP:</span>
                      <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{networkInfo.hostIP}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Subnet:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">{networkInfo.subnet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">DHCP Client:</span>
                      <span className={`text-sm font-medium ${networkInfo.isDhcpClient ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {networkInfo.isDhcpClient ? 'Yes' : 'Static IP'}
                      </span>
                    </div>
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
                          <p className="font-mono mt-1">Primary DNS: {networkInfo.hostIP}</p>
                          <p className="font-mono">Secondary DNS: {networkInfo.gateway}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Quick Access
                </h3>
                <div className="space-y-2">
                  {quickLinks.map((link) => (
                    link.onClick ? (
                      <button
                        type="button"
                        key={link.name}
                        onClick={link.onClick}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-sm ${link.color}`}
                      >
                        <div className="flex items-center space-x-3">
                          {link.icon}
                          <span className="text-sm font-medium">{link.name}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </button>
                    ) : (
                      <a
                        key={link.name}
                        href={link.url}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-sm ${link.color}`}
                      >
                        <div className="flex items-center space-x-3">
                          {link.icon}
                          <span className="text-sm font-medium">{link.name}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DNS Setup Guide */}
          {!isDnsConfigured && networkInfo && !loading && (
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
          )}
        </div>

        {/* SearXNG Config Modal */}
        {showSearxngConfig && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={this.closeSearxngConfig}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SearXNG Configuration</h2>
                <button
                  type="button"
                  onClick={this.closeSearxngConfig}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <SearxngConfig />
            </div>
          </div>
        )}
      </div>
    )
  }
}