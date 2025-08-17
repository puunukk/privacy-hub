import { PureComponent } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Server, Cpu, Activity, HardDrive, MemoryStick } from 'lucide-react'
import { safeFormatLoadAverage } from '@/utils/formatLoadAverage'
import { calculateSystemMemoryPercent, calculateSystemStoragePercent, getMemoryStatusColor, getStorageStatusColor, getCpuUsagePercent } from '@/utils/calculateSystemMetrics'
import { formatUptime } from '@/utils/formatUptime'
import { cn } from '@/utils/cn'
import { Typography } from '@/components/ui/Typography'
import type { RootState } from '@/store'

const mapStateToProps = (state: RootState) => ({
  dockerInfo: state.containers.dockerInfo,
  systemInfo: state.systemInfo.data,
  systemMetrics: state.metrics.data,
  temperatureCelsius: state.metrics.data?.cpu_temp ?? null,
  temperatureError: state.metrics.error,
  isTemperatureLoading: state.metrics.status === 'LOADING',
  networkInfo: state.systemInfo.data ? {
    hostIP: state.systemInfo.data.ip || 'unknown',
    hostname: state.systemInfo.data.hostname || 'privacy-hub',
    gateway: state.systemInfo.data.gateway || '192.168.1.1',
  } : null,
})

const connector = connect(mapStateToProps)
type SystemInfoCardProps = ConnectedProps<typeof connector>



class SystemInfoCard extends PureComponent<SystemInfoCardProps> {

  renderSystemInfo = () => {
    const { networkInfo, systemInfo, systemMetrics, temperatureCelsius, isTemperatureLoading, temperatureError } = this.props

    return (
      <div>
        {/* System Identity */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Typography.Text size="lg" weight="bold" color="primary">
              {networkInfo?.hostname || systemInfo?.hostname || 'Unknown'}
            </Typography.Text>
            <Typography.Text size="xs" color="muted" className="block">
              Hostname
            </Typography.Text>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Typography.Text size="lg" weight="bold" color="primary">
              {networkInfo?.hostIP || systemInfo?.ip || 'Unknown'}
            </Typography.Text>
            <Typography.Text size="xs" color="muted" className="block">
              IP Address
            </Typography.Text>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* CPU */}
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Cpu className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
            <Typography.Text size="lg" weight="bold" color="primary">
              {getCpuUsagePercent(systemMetrics) > 0 ? `${getCpuUsagePercent(systemMetrics)}%` : 'N/A'}
            </Typography.Text>
            <Typography.Text size="xs" color="muted" className="block">
              CPU Usage
            </Typography.Text>
          </div>

          {/* Memory */}
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <MemoryStick className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
            <Typography.Text size="lg" weight="bold" className={cn(getMemoryStatusColor(calculateSystemMemoryPercent(systemMetrics)))}>
              {calculateSystemMemoryPercent(systemMetrics) > 0 ? `${calculateSystemMemoryPercent(systemMetrics).toFixed(1)}%` : 'N/A'}
            </Typography.Text>
            <Typography.Text size="xs" color="muted" className="block">
              Memory Usage
            </Typography.Text>
          </div>

          {/* Storage */}
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <HardDrive className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
            <Typography.Text size="lg" weight="bold" className={cn(getStorageStatusColor(calculateSystemStoragePercent(systemMetrics)))}>
              {calculateSystemStoragePercent(systemMetrics) > 0 ? `${calculateSystemStoragePercent(systemMetrics).toFixed(1)}%` : 'N/A'}
            </Typography.Text>
            <Typography.Text size="xs" color="muted" className="block">
              Storage Usage
            </Typography.Text>
          </div>

          {/* Temperature */}
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Activity className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
            <Typography.Text size="lg" weight="bold" color="primary">
              {isTemperatureLoading && '...'}
              {!isTemperatureLoading && temperatureError && (
                <Typography.Text size="lg" weight="bold" color="danger">Error</Typography.Text>
              )}
              {!isTemperatureLoading && !temperatureError && temperatureCelsius !== null &&
                `${temperatureCelsius.toFixed(1)}°C`}
              {!isTemperatureLoading && !temperatureError && temperatureCelsius === null && 'N/A'}
            </Typography.Text>
            <Typography.Text size="xs" color="muted" className="block">
              CPU Temp
            </Typography.Text>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-2">
          {systemMetrics?.load_avg && (
            <div className="flex justify-between items-center">
              <Typography.Text size="sm" color="muted">System Load:</Typography.Text>
              <Typography.Text size="sm" weight="medium" color="primary">
                {safeFormatLoadAverage(systemMetrics.load_avg)}
              </Typography.Text>
            </div>
          )}
          {systemInfo?.uptime && (
            <div className="flex justify-between items-center">
              <Typography.Text size="sm" color="muted">Uptime:</Typography.Text>
              <Typography.Text size="sm" weight="medium" color="primary">
                {formatUptime(parseFloat(systemInfo.uptime))}
              </Typography.Text>
            </div>
          )}
        </div>
      </div>
    )
  }



  render() {
    const { networkInfo, systemInfo, systemMetrics, temperatureCelsius, isTemperatureLoading, temperatureError } = this.props

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <Typography.Text size="lg" weight="semibold" color="primary">
              Privacy Hub Status</Typography.Text>
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {/* System Identity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Typography.Text size="lg" weight="bold" color="primary">
                {networkInfo?.hostname || systemInfo?.hostname || 'Unknown'}
              </Typography.Text>
              <Typography.Text size="xs" color="muted" className="block">
                Hostname
              </Typography.Text>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Typography.Text size="lg" weight="bold" color="primary">
                {networkInfo?.hostIP || systemInfo?.ip || 'Unknown'}
              </Typography.Text>
              <Typography.Text size="xs" color="muted" className="block">
                IP Address
              </Typography.Text>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {/* CPU */}
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Cpu className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <Typography.Text size="lg" weight="bold" color="primary">
                {getCpuUsagePercent(systemMetrics) > 0 ? `${getCpuUsagePercent(systemMetrics)}%` : 'N/A'}
              </Typography.Text>
              <Typography.Text size="xs" color="muted" className="block">
                CPU Usage
              </Typography.Text>
            </div>

            {/* Memory */}
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MemoryStick className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <Typography.Text size="lg" weight="bold" className={cn(getMemoryStatusColor(calculateSystemMemoryPercent(systemMetrics)))}>
                {calculateSystemMemoryPercent(systemMetrics) > 0 ? `${calculateSystemMemoryPercent(systemMetrics).toFixed(1)}%` : 'N/A'}
              </Typography.Text>
              <Typography.Text size="xs" color="muted" className="block">
                Memory Usage
              </Typography.Text>
            </div>

            {/* Storage */}
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <HardDrive className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <Typography.Text size="lg" weight="bold" className={cn(getStorageStatusColor(calculateSystemStoragePercent(systemMetrics)))}>
                {calculateSystemStoragePercent(systemMetrics) > 0 ? `${calculateSystemStoragePercent(systemMetrics).toFixed(1)}%` : 'N/A'}
              </Typography.Text>
              <Typography.Text size="xs" color="muted" className="block">
                Storage Usage
              </Typography.Text>
            </div>

            {/* Temperature */}
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Activity className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <Typography.Text size="lg" weight="bold" color="primary">
                {isTemperatureLoading && '...'}
                {!isTemperatureLoading && temperatureError && (
                  <Typography.Text size="lg" weight="bold" color="danger">Error</Typography.Text>
                )}
                {!isTemperatureLoading && !temperatureError && temperatureCelsius !== null &&
                  `${temperatureCelsius.toFixed(1)}°C`}
                {!isTemperatureLoading && !temperatureError && temperatureCelsius === null && 'N/A'}
              </Typography.Text>
              <Typography.Text size="xs" color="muted" className="block">
                CPU Temp
              </Typography.Text>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-2">
            {systemMetrics?.load_avg && (
              <div className="flex justify-between items-center">
                <Typography.Text size="sm" color="muted">System Load:</Typography.Text>
                <Typography.Text size="sm" weight="medium" color="primary">
                  {safeFormatLoadAverage(systemMetrics.load_avg)}
                </Typography.Text>
              </div>
            )}
            {systemInfo?.uptime && (
              <div className="flex justify-between items-center">
                <Typography.Text size="sm" color="muted">Uptime:</Typography.Text>
                <Typography.Text size="sm" weight="medium" color="primary">
                  {formatUptime(parseFloat(systemInfo.uptime))}
                </Typography.Text>
              </div>
            )}
          </div>


        </div>
      </div>
    )
  }
}

export default connector(SystemInfoCard)
