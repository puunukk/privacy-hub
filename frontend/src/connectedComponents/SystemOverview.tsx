import { PureComponent } from 'react'
import { connect } from 'react-redux'
import {
  Thermometer,
  MemoryStick,
  Cpu,
  HardDrive,
  Network,
  Zap
} from 'lucide-react'
import { ModernMetricCard } from '@/components/dashboard/ModernMetricCard'
import { Typography } from '@/components/ui/Typography'
import {
  convertMemory,
  convertStorage,
  convertCpuLoad,
  convertUptime,
  convertTemperature,
  convertNetwork,
  getTrendFromPercent
} from '@/utils/systemConverters'
import type { RootState } from '@/store'

interface SystemOverviewProps {
  systemMetrics: any
  systemInfo: any
  isLoading: boolean
}

class SystemOverview extends PureComponent<SystemOverviewProps> {
  render() {
    const { systemMetrics, systemInfo, isLoading } = this.props

    // Convert raw data using utility functions
    const temperature = convertTemperature(systemMetrics?.cpu_temp)
    const memory = convertMemory(systemMetrics?.memory?.used, systemMetrics?.memory?.total)
    const storage = convertStorage(
      systemMetrics?.storage?.root_partition?.used,
      systemMetrics?.storage?.root_partition?.total,
      systemMetrics?.storage?.root_partition?.free
    )
    const cpuLoad = convertCpuLoad(systemMetrics?.load_avg, 4)
    const uptime = convertUptime(systemInfo?.uptime)
    const network = convertNetwork(systemInfo?.ip, systemInfo?.gateway, systemInfo?.dns)

    return (
      <div className="px-4">
        {/* Main Dashboard Grid - 6 columns on large screens */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">

          {/* Temperature - Featured Card */}
          <ModernMetricCard
            title="CPU Temp"
            value={temperature.value}
            unit="°C"
            icon={<Thermometer className="w-5 h-5" />}
            trend={temperature.trend}
            subtitle={temperature.subtitle}
            isLoading={isLoading}
          />

          {/* CPU Load */}
          <ModernMetricCard
            title="CPU Load"
            value={cpuLoad.current.toFixed(2)}
            icon={<Cpu className="w-5 h-5" />}
            trend={getTrendFromPercent(cpuLoad.percentUsed, 100, 70)}
            subtitle={`${cpuLoad.percentUsed}% used`}
            isLoading={isLoading}
            progress={cpuLoad.percentUsed}
          />

          {/* Memory */}
          <ModernMetricCard
            title="Memory"
            value={memory.usedFormatted.split(' ')[0]}
            unit={`/ ${memory.totalFormatted}`}
            icon={<MemoryStick className="w-5 h-5" />}
            trend={getTrendFromPercent(memory.percent)}
            subtitle={`${memory.percent.toFixed(0)}% used`}
            isLoading={isLoading}
            progress={memory.percent}
          />

          {/* Storage */}
          <ModernMetricCard
            title="Storage"
            value={storage.freeGB}
            unit="GB free"
            icon={<HardDrive className="w-5 h-5" />}
            trend={getTrendFromPercent(storage.usedPercent)}
            subtitle={`${storage.usedPercent.toFixed(0)}% used`}
            isLoading={isLoading}
            progress={storage.usedPercent}
          />

          {/* Network */}
          <ModernMetricCard
            title="Network"
            icon={<Network className="w-5 h-5" />}
            trend={network.trend}
            isLoading={isLoading}
          >
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Typography.Text variant="subtitle2" size="xs" weight='light' color="muted">IP</Typography.Text>
                <Typography.Text variant="mono-primary">{systemInfo?.ip || 'N/A'}</Typography.Text>
              </div>
              <div className="flex justify-between items-center">
                <Typography.Text variant="subtitle2" size="2xs" weight='light' color="muted">GW</Typography.Text>
                <Typography.Text variant="mono-sm" color="muted">{systemInfo?.gateway || 'N/A'}</Typography.Text>
              </div>
              <div className="flex justify-between items-center">
                <Typography.Text variant="subtitle2" size="2xs" weight='light' color="muted">DNS</Typography.Text>
                <Typography.Text variant="mono-sm" color="secondary">{systemInfo?.dns || 'N/A'}</Typography.Text>
              </div>
            </div>
          </ModernMetricCard>

          {/* Uptime */}
          <ModernMetricCard
            title="Uptime"
            value={uptime.value}
            unit={uptime.unit}
            icon={<Zap className="w-5 h-5" />}
            trend="good"
            subtitle={systemInfo?.hostname ? `Host: ${systemInfo.hostname}` : 'System'}
            isLoading={isLoading}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  systemMetrics: state.metrics?.data || null,
  systemInfo: state.systemInfo?.data || null,
  isLoading: state.metrics?.status === 'LOADING' || state.systemInfo?.status === 'LOADING'
})

export const ConnectedSystemOverview = connect(mapStateToProps)(SystemOverview)
export default ConnectedSystemOverview