import type { ContainerStats } from '@/types/docker'

/**
 * Calculate actual memory usage from Docker stats
 * Handles both cgroup v1 and v2 formats
 */
export const calculateMemoryUsage = (stats: ContainerStats): number => {
    const { memory_stats } = stats
    
    if (!memory_stats) {
        return 0
    }
    
    // Method 1: Direct usage field (cgroup v1)
    if (memory_stats.usage && memory_stats.usage > 0) {
        // In cgroup v1, we need to subtract cache to get actual memory usage
        const cache = memory_stats.stats?.cache || 0
        return Math.max(0, memory_stats.usage - cache)
    }
    
    // Method 2: From detailed stats (cgroup v2 or when usage is not available)
    if (memory_stats.stats) {
        const stats = memory_stats.stats
        
        // Try different fields that represent memory usage
        // Priority order based on accuracy
        
        // RSS (Resident Set Size) - most accurate for actual memory usage
        if (stats.rss && stats.rss > 0) {
            return stats.rss
        }
        
        // Total RSS 
        if (stats.total_rss && stats.total_rss > 0) {
            return stats.total_rss
        }
        
        // Anonymous memory + file cache
        if ((stats.anon || stats.file)) {
            const anon = stats.anon || 0
            const file = stats.file || 0
            // For actual usage, we typically want anonymous memory
            // File cache can be reclaimed, so it's less critical
            return anon > 0 ? anon : (anon + file)
        }
        
        // Active + Inactive anonymous memory
        if (stats.active_anon || stats.inactive_anon) {
            const activeAnon = stats.active_anon || 0
            const inactiveAnon = stats.inactive_anon || 0
            return activeAnon + inactiveAnon
        }
        
        // Fallback: Any value we can find
        const possibleFields = [
            'rss_huge',
            'mapped_file',
            'active_file',
            'inactive_file',
            'unevictable'
        ]
        
        for (const field of possibleFields) {
            const value = stats[field]
            if (value && value > 0) {
                return value
            }
        }
    }
    
    return 0
}

/**
 * Get memory limit from stats
 */
export const getMemoryLimit = (stats: ContainerStats): number => {
    return stats.memory_stats?.limit || 0
}