import { PureComponent, type ReactNode } from 'react'
import { Server, ChevronDown, ChevronRight, Cpu, Activity } from 'lucide-react'
import type { DockerInfo } from '../types/docker'
import type { RealNetworkInfo } from '../utils/network'
import { safeFormatLoadAverage, safeGetLoadAverageColor } from '@/utils/formatLoadAverage'
import { cn } from '@/utils/cn'

interface SystemInfoCardProps {
  dockerInfo: DockerInfo | null
  networkInfo?: RealNetworkInfo | null
  systemInfo?: any
  systemMetrics?: any
  temperatureCelsius: number | null
  isTemperatureLoading: boolean
  temperatureError: string | null
}

interface SystemInfoCardState {
  expandedSections: {
    basic: boolean
    docker: boolean
  }
}

export class SystemInfoCard extends PureComponent<SystemInfoCardProps, SystemInfoCardState> {
  constructor(props: SystemInfoCardProps) {
    super(props)
    this.state = {
      expandedSections: {
        basic: true,
        docker: false
      }
    }
  }

  toggleSection = (section: keyof SystemInfoCardState['expandedSections']) => {
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
    section: keyof SystemInfoCardState['expandedSections'],
    count?: number
  ) => {
    const isExpanded = this.state.expandedSections[section]

    return (
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => this.toggleSection(section)}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
          {count !== undefined && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </div>
    )
  }

  renderBasicInfo = () => {
    const { networkInfo, systemInfo, systemMetrics, temperatureCelsius, isTemperatureLoading, temperatureError } = this.props
    const isExpanded = this.state.expandedSections.basic

    if (!isExpanded) return null

    return (
      <div className="px-4 pb-4 space-y-3">
        {/* Essential System Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {networkInfo?.hostname || systemInfo?.hostname || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Hostname</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {networkInfo?.hostIP || systemInfo?.ip || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">IP Address</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-2">
          {systemMetrics?.cpu_usage && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">CPU Usage:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {systemMetrics.cpu_usage.toFixed(1)}%
              </span>
            </div>
          )}
          {systemMetrics?.load_avg && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Load Average:</span>
              <span className={cn("text-sm font-medium", safeGetLoadAverageColor(systemMetrics.load_avg))}>
                {safeFormatLoadAverage(systemMetrics.load_avg)}
              </span>
            </div>
          )}
          {(temperatureCelsius !== null || isTemperatureLoading || temperatureError) && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">CPU Temp:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {isTemperatureLoading && 'Loading...'}
                {!isTemperatureLoading && temperatureError && (
                  <span className="text-red-600 dark:text-red-400">{temperatureError}</span>
                )}
                {!isTemperatureLoading && !temperatureError && temperatureCelsius !== null && `${temperatureCelsius.toFixed(1)}°C`}
              </span>
            </div>
          )}
          {systemInfo?.uptime && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Uptime:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {`${Math.floor(parseFloat(systemInfo.uptime) / 3600)}h ${Math.floor((parseFloat(systemInfo.uptime) % 3600) / 60)}m`}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  renderDockerInfo = () => {
    const { dockerInfo } = this.props
    const isExpanded = this.state.expandedSections.docker

    if (!isExpanded || !dockerInfo) return null

    return (
      <div className="px-4 pb-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Docker Version:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.ServerVersion}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">OS:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.OperatingSystem}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Architecture:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.Architecture}</span>
        </div>
      </div>
    )
  }

  render() {
    const { dockerInfo } = this.props

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>System Overview</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Basic Information Section */}
          <div>
            {this.renderSectionHeader('System Info', <Activity className="w-4 h-4" />, 'basic')}
            {this.renderBasicInfo()}
          </div>

          {/* Docker Information Section */}
          {dockerInfo && (
            <div>
              {this.renderSectionHeader('Docker', <Server className="w-4 h-4" />, 'docker')}
              {this.renderDockerInfo()}
            </div>
          )}
        </div>
      </div>
    )
  }
}
