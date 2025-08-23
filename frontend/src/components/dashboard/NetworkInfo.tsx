import { Component } from 'react'
import { Network, Wifi, Container, Server, CheckCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { SystemInfo } from '@/types/systemInfo'
import type { DockerInfo } from '@/types/docker'

interface NetworkInfoProps {
  systemInfo?: SystemInfo | null
  dockerInfo?: DockerInfo | null
  containers?: { running: number; total: number }
  isLoading?: boolean
}

export class NetworkInfo extends Component<NetworkInfoProps> {
  render() {
    const { systemInfo, dockerInfo, containers, isLoading = false } = this.props

    const cardClasses = cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    )

    if (isLoading) {
      return (
        <div className={cardClasses}>
          <div className="animate-pulse">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={cardClasses}>
        <div className="flex items-center space-x-3 mb-6">
          <Network className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Info</h3>
        </div>

        <div className="space-y-4">
          {/* Network Information */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Wifi className="w-4 h-4" />
              <span>Network</span>
            </div>
            
            <div className="ml-6 space-y-2">
              {systemInfo?.ip && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{systemInfo.ip}</span>
                </div>
              )}
              
              {systemInfo?.gateway && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gateway:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{systemInfo.gateway}</span>
                </div>
              )}
              
              {systemInfo?.dns && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">DNS:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{systemInfo.dns}</span>
                </div>
              )}
            </div>
          </div>

          {/* Docker Information */}
          {(dockerInfo || containers) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                <Container className="w-4 h-4" />
                <span>Docker</span>
              </div>
              
              <div className="ml-6 space-y-2">
                {dockerInfo && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Version:</span>
                      <span className="text-gray-900 dark:text-white">{dockerInfo.ServerVersion}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">OS:</span>
                      <span className="text-gray-900 dark:text-white">{dockerInfo.OperatingSystem}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Architecture:</span>
                      <span className="text-gray-900 dark:text-white">{dockerInfo.Architecture}</span>
                    </div>
                  </>
                )}
                
                {containers && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Containers:</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 text-sm">{containers.running}</span>
                      </div>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{containers.total}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              <Server className="w-4 h-4" />
              <span>System</span>
            </div>
            
            <div className="ml-6 space-y-2">
              {systemInfo?.hostname && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hostname:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{systemInfo.hostname}</span>
                </div>
              )}
              
              {systemInfo?.uptime && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                  <span className="text-gray-900 dark:text-white">{systemInfo.uptime}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 text-sm">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}