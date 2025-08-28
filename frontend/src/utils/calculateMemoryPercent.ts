import type { ContainerStats } from '@/types/docker'
import { calculateMemoryUsage, getMemoryLimit } from './calculateMemoryUsage'

export const calculateMemoryPercent = (stats: ContainerStats): number => {
    const usage = calculateMemoryUsage(stats)
    const limit = getMemoryLimit(stats)
    
    if (usage > 0 && limit > 0) {
        return (usage / limit) * 100
    }
    
    return 0
}
