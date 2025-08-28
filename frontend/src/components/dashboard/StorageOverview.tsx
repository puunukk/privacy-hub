import { Component } from 'react'
import { HardDrive, Database } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatBytes } from '@/utils/systemUtils'
import type { StorageInfo } from '@/types/metrics'

interface StorageOverviewProps {
  storage?: StorageInfo
  isLoading?: boolean
}

export class StorageOverview extends Component<StorageOverviewProps> {

  render() {
    const { storage, isLoading = false } = this.props

    const cardClasses = cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    )

    if (isLoading) {
      return (
        <div className={cardClasses}>
          <div className="animate-pulse">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (!storage) {
      return (
        <div className={cardClasses}>
          <div className="flex items-center space-x-3 mb-6">
            <HardDrive className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Storage</h3>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No storage data available</p>
        </div>
      )
    }

    // Prepare partitions data - filter out root partition from partitions to avoid duplicates
    const otherPartitions = Object.entries(storage.partitions || {})
      .filter(([name]) => !name.includes('/') && !name.includes('root'))
      .map(([name, data]) => ({
        name: name,
        ...data
      }))

    const allPartitions = [
      { name: 'Root (/)', ...storage.root_partition },
      ...otherPartitions
    ]

    return (
      <div className={cardClasses}>
        <div className="flex items-center space-x-3 mb-6">
          <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Storage Overview</h3>
        </div>

        <div className="space-y-6">
          {/* Main partitions */}
          <div className="space-y-4">
            {allPartitions.map((partition, index) => {
              const usedPercent = (partition.used / partition.total) * 100
              const trend = usedPercent > 90 ? 'warning' : usedPercent > 80 ? 'caution' : 'good'
              
              const progressColors = {
                good: 'bg-green-500',
                caution: 'bg-yellow-500', 
                warning: 'bg-red-500'
              }

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {partition.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {usedPercent.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={cn("h-2 rounded-full transition-all duration-300", progressColors[trend])}
                      style={{ width: `${Math.min(usedPercent, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatBytes(partition.used)} used</span>
                    <span>{formatBytes(partition.free)} free</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Storage devices summary */}
          {storage.storage_devices && storage.storage_devices.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Physical Devices ({storage.total_disks})
                </span>
              </div>
              
              <div className="space-y-2">
                {storage.storage_devices.slice(0, 3).map((device, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {device.name} ({device.type})
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatBytes(device.size)}
                    </span>
                  </div>
                ))}
                
                {storage.storage_devices.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{storage.storage_devices.length - 3} more devices
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}