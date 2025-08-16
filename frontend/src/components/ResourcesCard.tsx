import { PureComponent, type ReactNode } from 'react'
import { Activity, ChevronDown, ChevronRight, Cpu, MemoryStick, HardDrive, Gauge } from 'lucide-react'
import type { DockerInfo } from '../types/docker'
import { SystemResources } from './SystemResources'
import { safeFormatLoadAverage } from '@/utils/formatLoadAverage'
import { cn } from '@/utils/cn'

interface ResourcesCardProps {
  dockerInfo: DockerInfo | null
  systemMetrics?: any
  temperatureCelsius?: number | null
}

interface ResourcesCardState {
  expandedSections: {
    overview: boolean
    resources: boolean
  }
}

export class ResourcesCard extends PureComponent<ResourcesCardProps, ResourcesCardState> {
  constructor(props: ResourcesCardProps) {
    super(props)
    this.state = {
      expandedSections: {
        overview: true,
        resources: false
      }
    }
  }

  toggleSection = (section: keyof ResourcesCardState['expandedSections']) => {
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
    section: keyof ResourcesCardState['expandedSections'],
    status?: 'good' | 'warning' | 'critical',
    value?: string
  ) => {
    const isExpanded = this.state.expandedSections[section]

    const getStatusColor = () => {
      switch (status) {
        case 'good':
          return 'text-green-600 dark:text-green-400'
        case 'warning':
          return 'text-yellow-600 dark:text-yellow-400'
        case 'critical':
          return 'text-red-600 dark:text-red-400'
        default:
          return 'text-gray-600 dark:text-gray-400'
      }
    }

    return (
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => this.toggleSection(section)}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
          {status && (
            <div className={cn("w-2 h-2 rounded-full", {
              'bg-green-500': status === 'good',
              'bg-yellow-500': status === 'warning',
              'bg-red-500': status === 'critical'
            })} />
          )}
        </div>
        <div className="flex items-center space-x-2">
          {value && (
            <span className={cn("text-sm font-medium", getStatusColor())}>
              {value}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>
    )
  }

  renderOverview = () => {
    const { systemMetrics, temperatureCelsius } = this.props
    const isExpanded = this.state.expandedSections.overview

    if (!isExpanded || !systemMetrics) return null

    const getCpuStatus = () => {
      const cpuUsage = systemMetrics.cpu_usage || 0
      if (cpuUsage < 50) return 'good'
      if (cpuUsage < 80) return 'warning'
      return 'critical'
    }

    const getMemoryStatus = () => {
      const memoryUsage = systemMetrics.memory_usage || 0
      if (memoryUsage < 70) return 'good'
      if (memoryUsage < 90) return 'warning'
      return 'critical'
    }

    return (
      <div className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {systemMetrics.cpu_usage ? `${systemMetrics.cpu_usage.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">CPU Usage</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {systemMetrics.memory_usage ? `${systemMetrics.memory_usage.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Memory Usage</div>
          </div>
        </div>
        {temperatureCelsius && (
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {temperatureCelsius.toFixed(1)}°C
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">CPU Temperature</div>
          </div>
        )}
      </div>
    )
  }

  renderResources = () => {
    const { systemMetrics } = this.props
    const isExpanded = this.state.expandedSections.resources

    if (!isExpanded || !systemMetrics) return null

    return (
      <div className="px-4 pb-4">
        <SystemResources systemMetrics={systemMetrics} />
      </div>
    )
  }

  render() {
    const { systemMetrics } = this.props

    if (!systemMetrics) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Performance Metrics</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Loading performance metrics...
            </div>
          </div>
        </div>
      )
    }

    const getCpuStatus = () => {
      const cpuUsage = systemMetrics.cpu_usage || 0
      if (cpuUsage < 50) return 'good'
      if (cpuUsage < 80) return 'warning'
      return 'critical'
    }

    const getMemoryStatus = () => {
      const memoryUsage = systemMetrics.memory_usage || 0
      if (memoryUsage < 70) return 'good'
      if (memoryUsage < 90) return 'warning'
      return 'critical'
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Performance Metrics</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Overview Section */}
          <div>
            {this.renderSectionHeader(
              'Quick Stats',
              <Gauge className="w-4 h-4" />,
              'overview'
            )}
            {this.renderOverview()}
          </div>

          {/* Detailed Resources Section */}
          <div>
            {this.renderSectionHeader(
              'Detailed Resources',
              <Cpu className="w-4 h-4" />,
              'resources'
            )}
            {this.renderResources()}
          </div>
        </div>
      </div>
    )
  }
}
