import { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Activity, HardDrive, Thermometer, Zap } from 'lucide-react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { MetricCard } from '@/components/dashboard/MetricCard'
import type { RootState } from '@/store'

interface SystemMetricsSectionProps {
  systemMetrics: any
  isLoading: boolean
}

class SystemMetricsSection extends PureComponent<SystemMetricsSectionProps> {
  private getMemoryUsedPercent = () => {
    const { systemMetrics } = this.props
    return systemMetrics?.memory?.total && systemMetrics?.memory?.used ?
      ((systemMetrics.memory.used / systemMetrics.memory.total) * 100) : 0
  }

  private getStorageUsedPercent = () => {
    const { systemMetrics } = this.props
    return systemMetrics?.storage?.root_partition ?
      ((systemMetrics.storage.root_partition.used / systemMetrics.storage.root_partition.total) * 100) : 0
  }

  private getLoadAvg = () => {
    const { systemMetrics } = this.props
    return systemMetrics?.load_avg ?
      systemMetrics.load_avg.split(' ').map(parseFloat) : [0, 0, 0]
  }

  render() {
    const { systemMetrics, isLoading } = this.props
    const memoryUsedPercent = this.getMemoryUsedPercent()
    const storageUsedPercent = this.getStorageUsedPercent()
    const loadAvg = this.getLoadAvg()

    return (
      <SectionWrapper
        title="System Metrics"
        subtitle="Real-time performance monitoring"
        icon={<Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        contentClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* CPU Temperature */}
        <MetricCard
          title="CPU Temperature"
          value={systemMetrics?.cpu_temp ? `${systemMetrics.cpu_temp.toFixed(1)}°C` : '--'}
          icon={<Thermometer className="w-5 h-5" />}
          trend={systemMetrics?.cpu_temp ? (systemMetrics.cpu_temp > 70 ? 'warning' : systemMetrics.cpu_temp > 60 ? 'caution' : 'good') : 'neutral'}
          subtitle={systemMetrics?.cpu_temp ? (
            systemMetrics.cpu_temp > 70 ? 'Running hot' :
              systemMetrics.cpu_temp > 60 ? 'Warm' : 'Normal'
          ) : 'No data'}
          isLoading={isLoading}
        />

        {/* Memory Usage */}
        <MetricCard
          title="Memory Usage"
          value={systemMetrics?.memory?.total && systemMetrics?.memory?.used ? `${memoryUsedPercent.toFixed(1)}%` : '--'}
          icon={<Zap className="w-5 h-5" />}
          trend={memoryUsedPercent > 90 ? 'warning' : memoryUsedPercent > 75 ? 'caution' : 'good'}
          subtitle={systemMetrics?.memory?.total && systemMetrics?.memory?.used ? `${(systemMetrics.memory.used / 1024 / 1024).toFixed(0)}MB / ${(systemMetrics.memory.total / 1024 / 1024).toFixed(0)}MB` : 'No data'}
          isLoading={isLoading}
          progress={memoryUsedPercent}
        />

        {/* CPU Load */}
        <MetricCard
          title="CPU Load"
          value={loadAvg[0] ? loadAvg[0].toFixed(2) : '--'}
          icon={<Activity className="w-5 h-5" />}
          trend={loadAvg[0] > 2 ? 'warning' : loadAvg[0] > 1 ? 'caution' : 'good'}
          subtitle={systemMetrics?.load_avg ? `5m: ${loadAvg[1]?.toFixed(2)} • 15m: ${loadAvg[2]?.toFixed(2)}` : 'No data'}
          isLoading={isLoading}
        />

        {/* Storage Usage */}
        <MetricCard
          title="Storage"
          value={systemMetrics?.storage?.root_partition ? `${storageUsedPercent.toFixed(1)}%` : '--'}
          icon={<HardDrive className="w-5 h-5" />}
          trend={storageUsedPercent > 90 ? 'warning' : storageUsedPercent > 80 ? 'caution' : 'good'}
          subtitle={systemMetrics?.storage?.root_partition ?
            `${(systemMetrics.storage.root_partition.used / 1024 / 1024 / 1024).toFixed(1)}GB / ${(systemMetrics.storage.root_partition.total / 1024 / 1024 / 1024).toFixed(1)}GB` :
            'No data'
          }
          isLoading={isLoading}
          progress={storageUsedPercent}
        />
      </SectionWrapper>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  systemMetrics: state.metrics?.data || null,
  isLoading: state.metrics?.status === 'LOADING'
})

export const ConnectedSystemMetricsSection = connect(mapStateToProps)(SystemMetricsSection)