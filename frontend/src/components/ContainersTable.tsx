import type { Dispatch } from '@reduxjs/toolkit'
import { connect, ConnectedProps } from 'react-redux'
import { Component } from 'react'
import { Server, Wifi, WifiOff, AlertCircle, Grid3X3, List } from 'lucide-react'

import { ContainerRow } from '@/components/ContainerRow'
import { ContainerLogs } from '@/components/ContainerLogs'
import { Button } from '@/components/ui/Button'
//import { CountdownTimer } from '@/components/ui/CountdownTimer'
import type { RootState } from '@/store'
import { cn } from '@/utils/cn'

const mapStateToProps = (state: RootState) => ({
  containers: state.containers.containers,
  dockerInfo: state.containers.dockerInfo,
  isContainersLoading: state.containers.isLoading,
  containerError: state.containers.error,
  actionLoadingContainerId: state.containers.actionLoadingContainerId,
  containerStatus: {
    isConnected: state.containers.isConnected,
    //isPolling: state.containers.isPolling,
    //pollInterval: state.containers.pollInterval,
    //nextPollTime: state.containers.nextPollTime,
    lastUpdate: state.containers.lastUpdateTime ? new Date(state.containers.lastUpdateTime) : null,
    totalRequests: state.containers.totalRequests,
    failedRequests: state.containers.failedRequests,
    errorMessage: state.containers.error,
  },
})

const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

const connector = connect(mapStateToProps, mapDispatchToProps)
type ContainersTableProps = ConnectedProps<typeof connector>

interface ContainersTableState {
  showLogsFor: {
    containerId: string
    containerName: string
  } | null
  viewMode: 'grid' | 'list'
}

class ContainersTableBase extends Component<ContainersTableProps, ContainersTableState> {
  constructor(props: ContainersTableProps) {
    super(props)
    this.state = {
      showLogsFor: null,
      viewMode: 'list'
    }
  }



  handleShowLogs = (containerId: string, containerName: string) => {
    this.setState({
      showLogsFor: { containerId, containerName }
    })
  }

  handleCloseLogs = () => {
    this.setState({
      showLogsFor: null
    })
  }

  handleViewModeToggle = () => {
    this.setState({
      viewMode: this.state.viewMode === 'grid' ? 'list' : 'grid'
    })
  }

  render() {
    const {
      containers,
      containerStatus,
      //isContainersLoading,
      containerError
    } = this.props

    const safeContainers = Array.isArray(containers) ? containers : []
    const runningCount = safeContainers.filter(c => c?.State === 'running').length
    const totalCount = safeContainers.length

    return (
      <div className="transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">

            <div className="flex items-center space-x-4">
              <h2 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white">
                Containers ({runningCount}/{totalCount} running)
              </h2>

              {/* Status Info */}
              <div className="flex flex-col space-x-4 text-sm">
                {/* Connection Status */}
                <div className="flex items-center space-x-1">
                  {containerStatus.isConnected ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">Disconnected</span>
                    </>
                  )}
                </div>

                {/* Auto-refresh Countdown */}
                {/*containerStatus.isPolling && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                    <CountdownTimer
                      lastUpdateTime={containerStatus.lastUpdate}
                      isPolling={containerStatus.isPolling}
                      pollInterval={containerStatus.pollInterval}
                      className="text-sm"
                    />
                  </div>
                )*/}

                {/* Error Indicator */}
                {containerError && (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-600 dark:text-yellow-400">Warning</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center space-x-1">
                <Button
                  variant={this.state.viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={this.handleViewModeToggle}
                  title="Grid View"
                  className="!p-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={this.state.viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={this.handleViewModeToggle}
                  title="List View"
                  className="!p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

            </div>
          </div>
        </div>

        {safeContainers.length === 0 ? (
          <div className={cn(
            "text-center py-12 px-6"
          )}>
            <Server className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No containers found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No Docker containers are currently available.
            </p>
          </div>
        ) : (
          <div className={cn(
            "p-6",
            this.state.viewMode === 'grid'
              ? "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-3"
          )}>
            {safeContainers.map((container) => (
              <ContainerRow
                key={container.Id}
                container={container}
                viewMode={this.state.viewMode}
                onShowLogs={this.handleShowLogs}
              />
            ))}
          </div>
        )}

        {/* Container Logs Modal */}
        {this.state.showLogsFor && (
          <ContainerLogs
            containerId={this.state.showLogsFor.containerId}
            containerName={this.state.showLogsFor.containerName}
            onClose={this.handleCloseLogs}
          />
        )}
      </div>
    )
  }
}

export const ContainersTable = connector(ContainersTableBase)