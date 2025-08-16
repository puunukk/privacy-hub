import { PureComponent } from 'react'
import { Info, HardDrive, MemoryStick } from 'lucide-react'

import { ProgressBar } from '@/components/ui/ProgressBar'
import { Typography } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'
import { formatBytes } from '@/utils/formatBytes'

interface SystemResourcesProps {
    systemMetrics?: any
}

interface ResourceCardProps {
    title: string
    icon: any
    color: 'blue' | 'green' | 'orange'
    children: any
    description?: string
}

interface MetricValueProps {
    label: string
    value: string
    unit: string
    description?: string
}

export class SystemResources extends PureComponent<SystemResourcesProps> {
    // Helper to extract value and unit from formatBytes utility
    private parseFormattedBytes(bytes: number): { value: number; unit: string } {
        const formatted = formatBytes(bytes)
        const parts = formatted.split(' ')
        const value = parseFloat(parts[0])
        const unit = parts[1]
        return { value, unit }
    }

    private MetricValue = ({ label, value, unit, description }: MetricValueProps) => (
        <div
            className="text-center group relative"
            title={description}
        >
            <Typography.Text
                size="sm"
                color="primary"
                weight="medium"
                className="block"
            >
                {value} {unit}
            </Typography.Text>
            <Typography.Text
                size="xs"
                color="muted"
                className="block"
            >
                {label}
            </Typography.Text>
            {description && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                </div>
            )}
        </div>
    )

    private ResourceCard = ({ title, icon, color, children, description }: ResourceCardProps) => {
        const colorClasses = {
            blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
            green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
            orange: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
        }

        const iconColorClasses = {
            blue: 'text-blue-600 dark:text-blue-400',
            green: 'text-green-600 dark:text-green-400',
            orange: 'text-orange-600 dark:text-orange-400'
        }

        return (
            <div
                className={cn(
                    'rounded-lg border p-4 space-y-4',
                    colorClasses[color]
                )}
                title={description}
            >
                <div className="flex items-center gap-2">
                    <div className={cn('p-1.5 rounded-md', iconColorClasses[color])}>
                        {icon}
                    </div>
                    <Typography.Title
                        level={5}
                        color="primary"
                        weight="semibold"
                        className="flex items-center gap-1"
                    >
                        {title}
                        {description && (
                            <Info className="h-4 w-4 text-gray-400" />
                        )}
                    </Typography.Title>
                </div>
                {children}
            </div>
        )
    }

    render() {
        const { systemMetrics } = this.props

        if (!systemMetrics) {
            return (
                <div className="text-center py-8">
                    <Typography.Text color="muted">
                        No system metrics available
                    </Typography.Text>
                </div>
            )
        }

        // Memory values are in KB, convert to bytes then format
        const memoryTotalBytes = systemMetrics.memory_total ? systemMetrics.memory_total * 1024 : 0
        const memoryUsedBytes = systemMetrics.memory_used ? systemMetrics.memory_used * 1024 : 0
        const memoryFreeBytes = systemMetrics.memory_free ? systemMetrics.memory_free * 1024 : 0

        const { value: memoryTotalValue, unit: memoryTotalUnit } = this.parseFormattedBytes(memoryTotalBytes)
        const { value: memoryUsedValue, unit: memoryUsedUnit } = this.parseFormattedBytes(memoryUsedBytes)
        const { value: memoryFreeValue, unit: memoryFreeUnit } = this.parseFormattedBytes(memoryFreeBytes)
        const memoryUsagePercent = memoryTotalBytes > 0 ? (memoryUsedBytes / memoryTotalBytes) * 100 : 0

        // Storage values are in bytes, convert to appropriate unit
        const storageTotal = systemMetrics.storage?.root_partition?.Total || 0
        const storageUsed = systemMetrics.storage?.root_partition?.Used || 0
        const storageFree = systemMetrics.storage?.root_partition?.Free || 0
        const storageUsagePercent = storageTotal > 0 ? (storageUsed / storageTotal) * 100 : 0

        const { value: storageTotalValue, unit: storageTotalUnit } = this.parseFormattedBytes(storageTotal)
        const { value: storageUsedValue, unit: storageUsedUnit } = this.parseFormattedBytes(storageUsed)
        const { value: storageFreeValue, unit: storageFreeUnit } = this.parseFormattedBytes(storageFree)

        return (
            <div className="space-y-6">
                {/* Memory Section */}
                <this.ResourceCard
                    title="System Memory (RAM)"
                    icon={<MemoryStick className="h-5 w-5" />}
                    color="blue"
                    description="Real-time memory usage statistics from /proc/meminfo"
                >
                    <div className="space-y-4">
                        <ProgressBar
                            label="Memory Usage"
                            used={memoryUsedValue}
                            total={memoryTotalValue}
                            unit={memoryTotalUnit as 'MB' | 'GB' | 'TB'}
                            color="blue"
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <this.MetricValue
                                label="Total"
                                value={memoryTotalValue.toFixed(1)}
                                unit={memoryTotalUnit}
                                description="Total physical memory installed in the system"
                            />
                            <this.MetricValue
                                label="Used"
                                value={memoryUsedValue.toFixed(1)}
                                unit={memoryUsedUnit}
                                description={`${memoryUsagePercent.toFixed(1)}% of total memory is currently in use`}
                            />
                            <this.MetricValue
                                label="Available"
                                value={memoryFreeValue.toFixed(1)}
                                unit={memoryFreeUnit}
                                description="Memory available for new applications and processes"
                            />
                        </div>

                        {/* Memory info text - only show if there's memory data */}
                        {memoryTotalBytes > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded p-2">
                                <Typography.Text size="xs" color="muted">
                                    Memory data is read from /proc/meminfo and updated in real-time.
                                    Used memory includes both active applications and cached data.
                                </Typography.Text>
                            </div>
                        )}
                    </div>
                </this.ResourceCard>

                {/* Storage Section */}
                <this.ResourceCard
                    title="Storage (Root Partition)"
                    icon={<HardDrive className="h-5 w-5" />}
                    color="green"
                    description="Disk usage statistics for the root filesystem (/)"
                >
                    <div className="space-y-4">
                        <ProgressBar
                            label="Disk Usage"
                            used={storageUsedValue}
                            total={storageTotalValue}
                            unit={storageTotalUnit as 'MB' | 'GB' | 'TB'}
                            color="green"
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <this.MetricValue
                                label="Total"
                                value={storageTotalValue.toFixed(1)}
                                unit={storageTotalUnit}
                                description="Total disk space on the root partition"
                            />
                            <this.MetricValue
                                label="Used"
                                value={storageUsedValue.toFixed(1)}
                                unit={storageUsedUnit}
                                description={`${storageUsagePercent.toFixed(1)}% of disk space is currently used`}
                            />
                            <this.MetricValue
                                label="Free"
                                value={storageFreeValue.toFixed(1)}
                                unit={storageFreeUnit}
                                description="Available disk space for new files and data"
                            />
                        </div>

                        {/* Storage info text */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded p-2">
                            <Typography.Text size="xs" color="muted">
                                {storageTotal > 0
                                    ? "Storage data is collected using system calls and represents the root filesystem (/). Free space includes reserved space for system operations."
                                    : "No storage data available. This might indicate a backend issue with storage detection."
                                }
                            </Typography.Text>
                        </div>
                    </div>
                </this.ResourceCard>
            </div>
        )
    }
}
