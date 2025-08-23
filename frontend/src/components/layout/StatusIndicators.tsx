import { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from '@reduxjs/toolkit'
import { RefreshCw, Clock, AlertCircle, Wifi, WifiOff, Info, Server } from 'lucide-react'
import { ContainerActionTypes } from '@/sagas/docker/types'
import { Button } from '@/components/ui/Button'
import type { RootState } from '@/store'

interface StatusIndicatorsProps {
  // Redux props - only what this component needs
  isConnected: boolean
  isPolling: boolean
  pollInterval: number
  nextPollTime: number | null
  lastUpdate: Date | null
  totalRequests: number
  failedRequests: number
  errorMessage: string | null
  dispatch: Dispatch
}

interface StatusIndicatorsState {
  showDetails: boolean
  timeUntilNext: number
}

class StatusIndicators extends Component<StatusIndicatorsProps, StatusIndicatorsState> {
  private countdownInterval: ReturnType<typeof setInterval> | null = null

  constructor(props: StatusIndicatorsProps) {
    super(props)
    this.state = {
      showDetails: false,
      timeUntilNext: 0
    }
  }

  componentDidMount() {
    this.startCountdown()
  }

  componentWillUnmount() {
    this.stopCountdown()
  }

  componentDidUpdate(prevProps: StatusIndicatorsProps) {
    if (prevProps.nextPollTime !== this.props.nextPollTime) {
      this.startCountdown()
    }
  }

  private startCountdown = () => {
    this.stopCountdown()

    if (this.props.nextPollTime) {
      this.countdownInterval = setInterval(() => {
        const now = Date.now()
        const next = this.props.nextPollTime || 0
        const remaining = Math.max(0, next - now)

        this.setState({ timeUntilNext: remaining })

        if (remaining <= 0) {
          this.stopCountdown()
        }
      }, 1000)
    }
  }

  private stopCountdown = () => {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
      this.countdownInterval = null
    }
  }

  private handleRefresh = () => {
    this.props.dispatch({ type: ContainerActionTypes.REFRESH_CONTAINERS })
  }

  private handleRestartNginx = () => {
    this.props.dispatch({ type: ContainerActionTypes.RESTART_NGINX })
  }

  private toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }))
  }

  private formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }

  private formatLastUpdate = (): string => {
    if (!this.props.lastUpdate) return 'Never'

    const now = Date.now()
    const last = this.props.lastUpdate.getTime()
    const diff = now - last

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
  }

  private getStatusIcon = () => {
    const { isConnected, isPolling } = this.props
    if (!isConnected) {
      return <WifiOff className="w-4 h-4 text-red-500" />
    }
    if (isPolling) {
      return <Wifi className="w-4 h-4 text-green-500" />
    }
    return <AlertCircle className="w-4 h-4 text-yellow-500" />
  }

  private getStatusText = () => {
    const { isConnected, isPolling } = this.props
    if (!isConnected) return 'Disconnected'
    if (isPolling) return 'Connected'
    return 'Paused'
  }

  private getStatusColor = () => {
    const { isConnected, isPolling } = this.props
    if (!isConnected) return 'text-red-600 bg-red-50 border-red-200'
    if (isPolling) return 'text-green-600 bg-green-50 border-green-200'
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }

  render() {
    const { totalRequests, failedRequests, isPolling, isConnected, pollInterval, nextPollTime, errorMessage } = this.props
    const { showDetails, timeUntilNext } = this.state

    const successRate = totalRequests > 0 ?
      Math.round(((totalRequests - failedRequests) / totalRequests) * 100) : 0

    return (
      <div className="flex items-center space-x-2">
        {/* Main Status Indicator */}
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${this.getStatusColor()}`}>
          {this.getStatusIcon()}
          <span className="text-sm font-medium">{this.getStatusText()}</span>

          {isPolling && timeUntilNext > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{this.formatTime(timeUntilNext)}</span>
            </div>
          )}
        </div>

        {/* Details Toggle */}
        <Button
          variant="ghost"
          onClick={this.toggleDetails}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Show connection details"
        >
          <Info className="w-4 h-4" />
        </Button>

        {/* Refresh Button */}
        <Button
          variant="ghost"
          onClick={this.handleRefresh}
          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          title="Refresh now"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        {/* Nginx Restart Button */}
        <Button
          variant="ghost"
          onClick={this.handleRestartNginx}
          className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
          title="Restart Nginx"
        >
          <Server className="w-4 h-4" />
        </Button>

        {/* Details Panel */}
        {showDetails && (
          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 min-w-80">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Container Service Status
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Connection:</span>
                <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Polling:</span>
                <span className={`font-medium ${isPolling ? 'text-green-600' : 'text-gray-600'}`}>
                  {isPolling ? 'Active' : 'Stopped'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Interval:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {pollInterval / 1000}s
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last Update:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {this.formatLastUpdate()}
                </span>
              </div>

              {nextPollTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Next Update:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {timeUntilNext > 0 ? this.formatTime(timeUntilNext) : 'Now'}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Total Requests:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {totalRequests}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Failed Requests:</span>
                <span className={`font-medium ${failedRequests > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {failedRequests}
                </span>
              </div>

              {errorMessage && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-red-600 dark:text-red-400 text-xs">
                    <div className="font-medium mb-1">Last Error:</div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs">
                      {errorMessage}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Success Rate */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-xs">Success Rate:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${successRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {successRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

// Redux connection - only map what this component actually uses
const mapStateToProps = (state: RootState): Omit<StatusIndicatorsProps, 'dispatch'> => ({
  isConnected: state.containers.isConnected,
  isPolling: state.containers?.isPolling || false,
  pollInterval: state.containers?.pollInterval || 0,
  nextPollTime: state.containers?.nextPollTime || null,
  lastUpdate: state.containers.lastUpdateTime ? new Date(state.containers.lastUpdateTime) : null,
  totalRequests: state.containers.totalRequests,
  failedRequests: state.containers.failedRequests,
  errorMessage: state.containers.error
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
})

export default connect(mapStateToProps, mapDispatchToProps)(StatusIndicators)