import { Component } from 'react'
import { Network, Wifi, Container, Server, CheckCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Typography } from '@/components/ui/Typography'
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
          <Typography.Title level={3} weight="semibold">System Info</Typography.Title>
        </div>

        <div className="space-y-4">
          {/* Network Information */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4" />
              <Typography.Text size="sm" weight="medium" color="secondary">Network</Typography.Text>
            </div>
            
            <div className="ml-6 space-y-2">
              {systemInfo?.ip && (
                <div className="flex justify-between">
                  <Typography.Text color="secondary">IP Address:</Typography.Text>
                  <Typography.Text className="font-mono">{systemInfo.ip}</Typography.Text>
                </div>
              )}
              
              {systemInfo?.gateway && (
                <div className="flex justify-between">
                  <Typography.Text color="secondary">Gateway:</Typography.Text>
                  <Typography.Text className="font-mono">{systemInfo.gateway}</Typography.Text>
                </div>
              )}
              
              {systemInfo?.dns && (
                <div className="flex justify-between">
                  <Typography.Text color="secondary">DNS:</Typography.Text>
                  <Typography.Text className="font-mono">{systemInfo.dns}</Typography.Text>
                </div>
              )}
            </div>
          </div>

          {/* Docker Information */}
          {(dockerInfo || containers) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <Container className="w-4 h-4" />
                <Typography.Text size="sm" weight="medium" color="secondary">Docker</Typography.Text>
              </div>
              
              <div className="ml-6 space-y-2">
                {dockerInfo && (
                  <>
                    <div className="flex justify-between">
                      <Typography.Text color="secondary">Version:</Typography.Text>
                      <Typography.Text>{dockerInfo.ServerVersion}</Typography.Text>
                    </div>
                    
                    <div className="flex justify-between">
                      <Typography.Text color="secondary">OS:</Typography.Text>
                      <Typography.Text>{dockerInfo.OperatingSystem}</Typography.Text>
                    </div>
                    
                    <div className="flex justify-between">
                      <Typography.Text color="secondary">Architecture:</Typography.Text>
                      <Typography.Text>{dockerInfo.Architecture}</Typography.Text>
                    </div>
                  </>
                )}
                
                {containers && (
                  <div className="flex justify-between">
                    <Typography.Text color="secondary">Containers:</Typography.Text>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <Typography.Text size="sm" color="success">{containers.running}</Typography.Text>
                      </div>
                      <Typography.Text color="muted">/</Typography.Text>
                      <Typography.Text size="sm" color="secondary">{containers.total}</Typography.Text>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <Server className="w-4 h-4" />
              <Typography.Text size="sm" weight="medium" color="secondary">System</Typography.Text>
            </div>
            
            <div className="ml-6 space-y-2">
              {systemInfo?.hostname && (
                <div className="flex justify-between">
                  <Typography.Text color="secondary">Hostname:</Typography.Text>
                  <Typography.Text className="font-mono">{systemInfo.hostname}</Typography.Text>
                </div>
              )}
              
              {systemInfo?.uptime && (
                <div className="flex justify-between">
                  <Typography.Text color="secondary">Uptime:</Typography.Text>
                  <Typography.Text>{systemInfo.uptime}</Typography.Text>
                </div>
              )}
              
              <div className="flex justify-between">
                <Typography.Text color="secondary">Status:</Typography.Text>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <Typography.Text size="sm" color="success">Online</Typography.Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}