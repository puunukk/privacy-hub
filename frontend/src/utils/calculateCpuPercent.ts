import type { ContainerStats } from '../types/docker'

export const calculateCpuPercent = (stats: ContainerStats): number => {
    const { cpu_stats, precpu_stats } = stats

    const cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage
    const systemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage

    if (systemDelta > 0 && cpuDelta > 0) {
        return (cpuDelta / systemDelta) * 100
    }
    return 0
}
