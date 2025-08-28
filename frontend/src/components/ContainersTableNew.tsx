/**
 * @fileoverview Modern containers table using unified data manager
 * @author Privacy Hub Dashboard
 * 
 * This replaces the complex Redux-connected ContainersTable with a simple
 * class component that uses the unified data manager.
 */

import { Server, Wifi, WifiOff, AlertCircle, Grid3X3, List } from 'lucide-react'

import { ContainerRow, ContainerLogs } from '@/components/containers'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
// ContainerActionTypes removed - no longer needed since data fetching is handled by parent component
import { cn } from '@/utils/cn'

interface ContainersTableState {
  showLogsFor: {
    containerId: string
    containerName: string
  } | null
}

interface ContainersTableProps {
  dispatch: Dispatch
  containers: any[]
  dockerInfo: any
  isLoading: boolean
  error?: string | null
  viewMode: 'grid' | 'list'
}

export class ContainersTable extends Component<ContainersTableProps, ContainersTableState> {
  constructor(props: ContainersTableProps) {
    super(props)
    this.state = {
      showLogsFor: null
    }
  }

  componentDidMount() {
    // Data fetching is handled by PiDashboard parent component
    // This avoids duplicate API calls on the same page
  }

  private showLogs = (containerId: string, containerName: string) => {
    this.setState(prev => ({
      ...prev,
      showLogsFor: { containerId, containerName }
    }))
  }

  private hideLogs = () => {
    this.setState(prev => ({
      ...prev,
      showLogsFor: null
    }))
  }

  // Connection status indicator
  private renderConnectionStatus = () => {
    const { containers, error } = this.props
    const hasError = !!error
    const isEmpty = !containers || containers.length === 0

    return (
      <div className="flex items-center space-x-2 text-sm">
        {hasError ? (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-red-600 dark:text-red-400">
              Docker API Disconnected
            </span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400">
              Docker API Connected
            </span>
          </>
        )}

        {!hasError && !isEmpty && (
          <span className="text-gray-500 dark:text-gray-400">
            • {containers.length} container{containers.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    )
  }

  // Docker info panel
  private renderDockerInfo = () => {
    const { dockerInfo } = this.props
    if (!dockerInfo) return null

    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        {/* Title removed - handled by DockerContainersSection wrapper */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <Typography.Text color="muted">
              Version:</Typography.Text>
            <Typography.Text color='secondary' className="ml-2 font-mono">
              {dockerInfo.ServerVersion || 'Unknown'}</Typography.Text>
          </div>
          <div>
            <Typography.Text color="muted">
              OS:</Typography.Text>
            <Typography.Text color='secondary' className="ml-2 font-mono">
              {dockerInfo.OperatingSystem || 'Unknown'}</Typography.Text>
          </div>
          <div>
            <Typography.Text color="muted">
              Architecture:</Typography.Text>
            <Typography.Text color='secondary' className="ml-2 font-mono">
              {dockerInfo.Architecture || 'Unknown'}</Typography.Text>
          </div>
          <div>
            <Typography.Text color="muted">
              Images:</Typography.Text>
            <Typography.Text color='secondary' className="ml-2 font-mono">
              {dockerInfo.Images || 0}</Typography.Text>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { containers, dockerInfo, isLoading, error } = this.props

    const wrapperClassName = cn(
      'bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300',
      'p-4'
    )

    return (
      <>
        {/* Header */}
        {this.renderConnectionStatus()}
        {/* 
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <Typography.Title level={2} weight="bold">
                  Docker Containers
                </Typography.Title>
              </div>
              {this.renderConnectionStatus()}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={this.props.viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={this.toggleViewMode}
              >
                {this.props.viewMode === 'list' ? (
                  <><List className="w-4 h-4 mr-2" /> List View</>
                ) : (
                  <><Grid3X3 className="w-4 h-4 mr-2" /> Grid View</>
                )}
              </Button>
            </div>
          </div>
        </div>
        */}
        {/* Content */}
        <div className="p-4">
          {/* Docker Info */}
          {dockerInfo && (
            <div className="mb-6">
              {this.renderDockerInfo()}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <Typography.Title level={3} color="danger" className="mb-2">
                  Unable to Connect to Docker
                </Typography.Title>
                <Typography.Text color="muted">
                  {error}
                </Typography.Text>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !containers?.length && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <Typography.Text color="muted">
                  Loading containers...
                </Typography.Text>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && (!containers || containers.length === 0) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <Typography.Title level={3} color="muted" className="mb-2">
                  No Containers Found
                </Typography.Title>
                <Typography.Text color="muted">
                  No Docker containers are currently running or available.
                </Typography.Text>
              </div>
            </div>
          )}

          {/* Containers List/Grid */}
          {containers && containers.length > 0 && (
            <div className={cn(
              "space-y-4",
              this.props.viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0"
            )}>
              {containers.map((container) => (
                <ContainerRow
                  key={container.Id}
                  container={container}
                  onShowLogs={() => this.showLogs(container.Id, container.Names?.[0] || container.Id)}
                  viewMode={this.props.viewMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Container Logs Modal */}
        {this.state.showLogsFor && (
          <ContainerLogs
            containerId={this.state.showLogsFor.containerId}
            containerName={this.state.showLogsFor.containerName}
            onClose={this.hideLogs}
          />
        )}
      </>
    )
  }
}

// Connect to Redux
const mapStateToProps = (state: RootState) => ({
  containers: state.containers?.containers || [],
  dockerInfo: state.containers?.dockerInfo || null,
  isLoading: state.containers?.isLoading || false,
  error: state.containers?.error || undefined
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
})

// Export connected component
export const ConnectedContainersTable = connect(mapStateToProps, mapDispatchToProps)(ContainersTable)