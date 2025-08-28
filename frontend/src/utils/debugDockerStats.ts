/**
 * Debug utility for Docker stats
 * Enable this in development to see raw stats data
 */

import type { ContainerStats } from '@/types/docker'
import { formatBytes } from '@/utils/systemUtils'

export const debugDockerStats = (containerName: string, stats: ContainerStats): void => {
    if (process.env.NODE_ENV !== 'development') {
        return
    }

    // Only debug if explicitly enabled
    if (!window.localStorage.getItem('DEBUG_DOCKER_STATS')) {
        return
    }

    console.group(`🐳 Docker Stats Debug: ${containerName}`)
    
    console.log('Raw memory_stats:', stats.memory_stats)
    
    if (stats.memory_stats) {
        console.log('memory_stats.usage:', stats.memory_stats.usage)
        console.log('memory_stats.limit:', stats.memory_stats.limit)
        console.log('memory_stats.max_usage:', stats.memory_stats.max_usage)
        console.log('memory_stats.cache:', stats.memory_stats.cache)
        
        if (stats.memory_stats.stats) {
            console.log('Detailed stats:')
            Object.entries(stats.memory_stats.stats).forEach(([key, value]) => {
                if (value !== undefined && value > 0) {
                    console.log(`  ${key}:`, value, `(${formatBytes(value)})`)
                }
            })
        }
    }
    
    console.groupEnd()
}


// Export a helper to enable/disable debug mode
export const setDockerStatsDebug = (enabled: boolean): void => {
    if (enabled) {
        window.localStorage.setItem('DEBUG_DOCKER_STATS', '1')
        console.log('Docker stats debugging enabled. Refresh to see stats.')
    } else {
        window.localStorage.removeItem('DEBUG_DOCKER_STATS')
        console.log('Docker stats debugging disabled.')
    }
}

// Make it available globally in development
if (process.env.NODE_ENV === 'development') {
    (window as any).setDockerStatsDebug = setDockerStatsDebug
}