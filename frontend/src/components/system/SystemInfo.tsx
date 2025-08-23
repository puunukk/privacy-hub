import { Component } from 'react'
import { Server, X } from 'lucide-react'
import type { DockerInfo } from '@/types/docker'
import type { RealNetworkInfo } from '@/utils/network'
import { SystemInfoCard } from './SystemInfoCard'
import { ResourcesSummary } from './ResourcesSummary'
import { QuickAccessLinks } from './QuickAccessLinks'
import { NetworkSetupCard } from '@/components/network'
import { DnsSetupGuide } from '@/components/network/DnsSetupGuide'
import { SearXngConfig } from './SearxngConfig'

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

    const isDevelopment = window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443'
    const baseUrl = isDevelopment ? `${window.location.protocol}//localhost:${window.location.port}` : ''

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
              {dockerInfo && networkInfo && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    System Info
                  </h3>
                  <div className="space-y-3">
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
                    <SystemInfoCard dockerInfo={dockerInfo} />
                  </div>
                </div>
              )}

              {/* Resource Summary */}
              {dockerInfo && (
                <ResourcesSummary dockerInfo={dockerInfo} />
              )}

              {/* Network Configuration */}
              {networkInfo && (
                <NetworkSetupCard networkInfo={networkInfo} />
              )}

              {/* Quick Links */}
              <QuickAccessLinks 
                baseUrl={baseUrl}
                isDevelopment={isDevelopment}
                onSearxngConfig={this.openSearxngConfig}
              />
            </div>
          )}

          {/* DNS Setup Guide */}
          {networkInfo && !loading && (
            <DnsSetupGuide networkInfo={networkInfo} />
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
              <SearXngConfig />
            </div>
          </div>
        )}
      </div>
    )
  }
}