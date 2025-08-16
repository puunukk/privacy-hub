import type { SystemMetrics } from '../store/metrics/types'

/**
 * Calculate memory usage percentage from system metrics
 */
export const calculateSystemMemoryPercent = (systemMetrics: SystemMetrics | null): number => {
    if (!systemMetrics) return 0

    const { memory_total, memory_used } = systemMetrics
    if (memory_total > 0) {
        return (memory_used / memory_total) * 100
    }
    return 0
}

/**
 * Calculate storage usage percentage from system metrics
 */
export const calculateSystemStoragePercent = (systemMetrics: SystemMetrics | null): number => {
    if (!systemMetrics?.storage?.root_partition) return 0

    const { total, used } = systemMetrics.storage.root_partition
    if (total > 0) {
        return (used / total) * 100
    }
    return 0
}

/**
 * Get memory status color based on usage percentage
 */
export const getMemoryStatusColor = (usagePercent: number): string => {
    if (usagePercent < 70) return 'text-green-600 dark:text-green-400'
    if (usagePercent < 90) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
}

/**
 * Get storage status color based on usage percentage
 */
export const getStorageStatusColor = (usagePercent: number): string => {
    if (usagePercent < 70) return 'text-green-600 dark:text-green-400'
    if (usagePercent < 90) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
}

/**
 * Get load average value from system metrics
 */
export const getLoadAverage = (systemMetrics: SystemMetrics | null): string | null => {
    if (!systemMetrics?.load_avg) return null
    return systemMetrics.load_avg.split(' ')[0]
}
