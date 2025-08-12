import { Component } from 'react'
import { RefreshCw, Clock, AlertCircle, Wifi, WifiOff, Info, Server } from 'lucide-react'
import { withContainerRedux } from '../store/hoc/withRedux'
import type { ContainerReduxProps } from '../store/hoc/withRedux'
import { ContainerActionTypes } from '../store/actions/types'

interface StatusIndicatorsProps extends ContainerReduxProps {}

interface StatusIndicatorsState {
  showDetails: boolean
  timeUntilNext: number
}

class StatusIndicatorsBase extends Component<StatusIndicatorsProps, StatusIndicatorsState> {
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
    if (prevProps.containerStatus.nextPollTime !== this.props.containerStatus.nextPollTime) {
      this.startCountdown()
    }
  }

  private startCountdown = () => {
    this.stopCountdown()
    
    if (this.props.containerStatus.nextPollTime) {
      this.countdownInterval = setInterval(() => {
        const now = Date.now()
        const next = this.props.containerStatus.nextPollTime || 0
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
    if (!this.props.containerStatus.lastUpdate) return 'Never'
    
    const now = Date.now()
    const last = this.props.containerStatus.lastUpdate.getTime()
    const diff = now - last
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
  }

  private getStatusIcon = () => {
    const { containerStatus } = this.props
    if (!containerStatus.isConnected) {
      return <WifiOff className="w-4 h-4 text-red-500" />
    }
    if (containerStatus.isPolling) {
      return <Wifi className="w-4 h-4 text-green-500" />
    }
    return <AlertCircle className="w-4 h-4 text-yellow-500" />
  }

  private getStatusText = () => {
    const { containerStatus } = this.props
    if (!containerStatus.isConnected) return 'Disconnected'
    if (containerStatus.isPolling) return 'Connected'
    return 'Paused'
  }

  private getStatusColor = () => {
    const { containerStatus } = this.props
    if (!containerStatus.isConnected) return 'text-red-600 bg-red-50 border-red-200'
    if (containerStatus.isPolling) return 'text-green-600 bg-green-50 border-green-200'
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }

  render() {
    const { containerStatus } = this.props
    const { showDetails, timeUntilNext } = this.state

    const successRate = containerStatus.totalRequests > 0 ? 
      Math.round(((containerStatus.totalRequests - containerStatus.failedRequests) / containerStatus.totalRequests) * 100) : 0

    return (
      <div className="flex items-center space-x-2">
        {/* Main Status Indicator */}
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${this.getStatusColor()}`}>
          {this.getStatusIcon()}
          <span className="text-sm font-medium">{this.getStatusText()}</span>
          
          {containerStatus.isPolling && timeUntilNext > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{this.formatTime(timeUntilNext)}</span>
            </div>
          )}
        </div>

        {/* Details Toggle */}
        <button
          type="button"
          onClick={this.toggleDetails}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Show connection details"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={this.handleRefresh}
          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          title="Refresh now"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Nginx Restart Button */}
        <button
          type="button"
          onClick={this.handleRestartNginx}
          className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
          title="Restart Nginx"
        >
          <Server className="w-4 h-4" />
        </button>

        {/* Details Panel */}
        {showDetails && (
          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 min-w-80">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Container Service Status
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Connection:</span>
                <span className={`font-medium ${containerStatus.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {containerStatus.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Polling:</span>
                <span className={`font-medium ${containerStatus.isPolling ? 'text-green-600' : 'text-gray-600'}`}>
                  {containerStatus.isPolling ? 'Active' : 'Stopped'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Interval:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {containerStatus.pollInterval / 1000}s
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last Update:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {this.formatLastUpdate()}
                </span>
              </div>
              
              {containerStatus.nextPollTime && (
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
                  {containerStatus.totalRequests}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Failed Requests:</span>
                <span className={`font-medium ${containerStatus.failedRequests > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {containerStatus.failedRequests}
                </span>
              </div>
              
              {containerStatus.errorMessage && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-red-600 dark:text-red-400 text-xs">
                    <div className="font-medium mb-1">Last Error:</div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs">
                      {containerStatus.errorMessage}
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

export const StatusIndicators = withContainerRedux(StatusIndicatorsBase)