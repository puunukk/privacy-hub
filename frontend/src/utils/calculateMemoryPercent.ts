import type { ContainerStats } from '../types/docker'

export const calculateMemoryPercent = (stats: ContainerStats): number => {
    const { memory_stats } = stats
    if (memory_stats.usage && memory_stats.limit && memory_stats.limit > 0) {
        return (memory_stats.usage / memory_stats.limit) * 100
    }
    return 0
}
