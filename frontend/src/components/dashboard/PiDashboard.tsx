import { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from '@reduxjs/toolkit'
import { HardDrive, Zap, Thermometer, Activity, Settings } from 'lucide-react'
import type { RootState } from '@/store'
import { ContainerActionTypes } from '@/store/docker/types'
import { MetricsActionTypes } from '@/store/metrics/types'
import { SystemInfoActionTypes } from '@/store/systemInfo/types'
import { SystemActionsModal } from './SystemActionsModal'
import { MetricCard } from './MetricCard'
import { StorageOverview } from './StorageOverview'
import { Tools } from './Tools'
import { NetworkInfo } from './NetworkInfo'
import DataManagerMonitor from '@/components/debug/DataManagerMonitor'
import { NetworkConnectivityTest } from '@/components/debug/NetworkConnectivityTest'
import LoopManager from '@/components/settings/LoopManager'

interface PiDashboardProps {
  dispatch: Dispatch
  containers: any[]
  dockerInfo: any
  systemMetrics: any
  systemInfo: any
  isLoading: boolean
  hasErrors: boolean
}

interface PiDashboardState {
  showSystemModal: boolean
}

class PiDashboard extends Component<PiDashboardProps, PiDashboardState> {
  constructor(props: PiDashboardProps) {
    super(props)
    this.state = {
      showSystemModal: false
    }
  }

  componentDidMount() {
    // Fetch data when component mounts - simple and clean
    const { dispatch } = this.props
    dispatch({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST })
    dispatch({ type: MetricsActionTypes.FETCH_METRICS_REQUEST })
    dispatch({ type: SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST })
    dispatch({ type: ContainerActionTypes.FETCH_DOCKER_INFO_REQUEST })
  }

  private openSystemModal = () => {
    this.setState({ showSystemModal: true })
  }

  private closeSystemModal = () => {
    this.setState({ showSystemModal: false })
  }

  private getMemoryUsedPercent = () => {
    const { systemMetrics: metrics } = this.props
    return metrics?.memory?.total && metrics?.memory?.used ?
      ((metrics.memory.used / metrics.memory.total) * 100) : 0
  }

  private getStorageUsedPercent = () => {
    const { systemMetrics: metrics } = this.props
    return metrics?.storage?.root_partition ?
      ((metrics.storage.root_partition.used / metrics.storage.root_partition.total) * 100) : 0
  }

  private getLoadAvg = () => {
    const { systemMetrics: metrics } = this.props
    return metrics?.load_avg ?
      metrics.load_avg.split(' ').map(parseFloat) : [0, 0, 0]
  }

  private getContainerStats = () => {
    const { containers } = this.props
    const running = containers?.filter(c => c.State === 'running').length || 0
    const total = containers?.length || 0

    // Calculate total memory usage across all running containers
    let totalMemoryUsage = 0
    let totalMemoryLimit = 0

    if (containers) {
      containers.forEach(container => {
        if (container.State === 'running' && container.Stats) {
          const memUsage = container.Stats.memory_usage || 0
          const memLimit = container.Stats.memory_limit || 0
          totalMemoryUsage += memUsage
          totalMemoryLimit += memLimit
        }
      })
    }

    return {
      running,
      total,
      memoryUsage: totalMemoryUsage,
      memoryLimit: totalMemoryLimit,
      memoryPercent: totalMemoryLimit > 0 ? (totalMemoryUsage / totalMemoryLimit) * 100 : 0
    }
  }

  render() {
    const { systemMetrics: metrics, systemInfo, dockerInfo, isLoading, hasErrors } = this.props

    const memoryUsedPercent = this.getMemoryUsedPercent()
    const storageUsedPercent = this.getStorageUsedPercent()
    const loadAvg = this.getLoadAvg()
    const containerStats = this.getContainerStats()

    // Only show connection error if critical system data is missing AND we have errors
    const hasCriticalErrors = hasErrors && !metrics && !systemInfo && !isLoading;

    if (hasCriticalErrors) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
          <div className="text-center animate-fade-in">
            <Zap className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connection Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Unable to connect to Privacy Hub backend services
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p>• Check that Docker containers are running</p>
              <p>• Verify NGINX reverse proxy is accessible</p>
              <p>• Ensure Go backend service is healthy</p>
              <p>• Check Docker networking between containers</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry Connection
            </button>

            <div className="mt-8 max-w-2xl">
              <NetworkConnectivityTest />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="animate-fade-in">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  🍓 {systemInfo?.hostname || 'Privacy Hub'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {systemInfo?.ip && `${systemInfo.ip} • `}
                  {systemInfo?.uptime && `Uptime: ${systemInfo.uptime}`}
                </p>
              </div>
              <button
                onClick={this.openSystemModal}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <Settings className="w-4 h-4" />
                <span>Pi Commands</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* CPU Temperature */}
            <MetricCard
              title="CPU Temperature"
              value={metrics?.cpu_temp ? `${metrics.cpu_temp.toFixed(1)}°C` : '--'}
              icon={<Thermometer className="w-5 h-5" />}
              trend={metrics?.cpu_temp ? (metrics.cpu_temp > 70 ? 'warning' : metrics.cpu_temp > 60 ? 'caution' : 'good') : 'neutral'}
              subtitle={metrics?.cpu_temp ? (
                metrics.cpu_temp > 70 ? 'Running hot' :
                  metrics.cpu_temp > 60 ? 'Warm' : 'Normal'
              ) : 'No data'}
              isLoading={isLoading}
            />

            {/* Memory Usage */}
            <MetricCard
              title="Memory Usage"
              value={metrics?.memory?.total && metrics?.memory?.used ? `${memoryUsedPercent.toFixed(1)}%` : '--'}
              icon={<Zap className="w-5 h-5" />}
              trend={memoryUsedPercent > 90 ? 'warning' : memoryUsedPercent > 75 ? 'caution' : 'good'}
              subtitle={metrics?.memory?.total && metrics?.memory?.used ? `${(metrics.memory.used / 1024 / 1024).toFixed(0)}MB / ${(metrics.memory.total / 1024 / 1024).toFixed(0)}MB` : 'No data'}
              isLoading={isLoading}
              progress={memoryUsedPercent}
            />

            {/* CPU Load */}
            <MetricCard
              title="CPU Load"
              value={loadAvg[0] ? loadAvg[0].toFixed(2) : '--'}
              icon={<Activity className="w-5 h-5" />}
              trend={loadAvg[0] > 2 ? 'warning' : loadAvg[0] > 1 ? 'caution' : 'good'}
              subtitle={metrics?.load_avg ? `5m: ${loadAvg[1]?.toFixed(2)} • 15m: ${loadAvg[2]?.toFixed(2)}` : 'No data'}
              isLoading={isLoading}
            />

            {/* Storage Usage */}
            <MetricCard
              title="Storage"
              value={metrics?.storage?.root_partition ? `${storageUsedPercent.toFixed(1)}%` : '--'}
              icon={<HardDrive className="w-5 h-5" />}
              trend={storageUsedPercent > 90 ? 'warning' : storageUsedPercent > 80 ? 'caution' : 'good'}
              subtitle={metrics?.storage?.root_partition ?
                `${(metrics.storage.root_partition.used / 1024 / 1024 / 1024).toFixed(1)}GB / ${(metrics.storage.root_partition.total / 1024 / 1024 / 1024).toFixed(1)}GB` :
                'No data'
              }
              isLoading={isLoading}
              progress={storageUsedPercent}
            />
          </div>

          {/* Secondary Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Detailed Storage */}
            <StorageOverview
              storage={metrics?.storage}
              isLoading={isLoading}
            />

            {/* Network & System Info */}
            <NetworkInfo
              systemInfo={systemInfo}
              dockerInfo={dockerInfo}
              containers={containerStats}
              isLoading={isLoading}
            />
          </div>

          {/* Tools */}
          <Tools />

          {/* Loop Manager - ALWAYS SHOW so you can control polling */}
          <div className="mt-8">
            <LoopManager />
          </div>

          {/* Data Manager Monitor (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <DataManagerMonitor className="mt-8" />
          )}
        </div>

        {/* System Actions Modal */}
        {this.state.showSystemModal && (
          <SystemActionsModal
            isOpen={this.state.showSystemModal}
            onClose={this.closeSystemModal}
            hostname={systemInfo?.hostname}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  containers: state.containers?.containers || [],
  dockerInfo: state.containers?.dockerInfo || null,
  systemMetrics: state.metrics?.data || null,
  systemInfo: state.systemInfo?.data || null,
  isLoading: state.containers?.isLoading || state.metrics?.status === 'LOADING' || state.systemInfo?.status === 'LOADING',
  hasErrors: !!(state.containers?.error || state.metrics?.error || state.systemInfo?.error)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
})

export default connect(mapStateToProps, mapDispatchToProps)(PiDashboard)