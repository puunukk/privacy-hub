import type { DockerContainer, DockerInfo, ContainerAction, ContainerStats } from '../types/docker'

export const fetchDockerInfo = async (): Promise<DockerInfo> => {
  try {
    const response = await fetch('/api/docker/info')
    if (!response.ok) {
      throw new Error(`Failed to fetch Docker info: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    // Graceful fallback for standalone mode
    console.warn('Docker API not available - running in standalone mode:', error)
    throw error
  }
}

export const fetchContainers = async (): Promise<DockerContainer[]> => {
  try {
    const response = await fetch('/api/docker/containers/json?all=true')
    if (!response.ok) {
      throw new Error(`Failed to fetch containers: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    // Graceful fallback for standalone mode  
    console.warn('Docker API not available - running in standalone mode:', error)
    return []
  }
}

export const executeContainerAction = async (
  containerId: string, 
  action: ContainerAction
): Promise<void> => {
  if (action === 'privacy_reset') {
    // Privacy reset: stop, remove, and rebuild container
    // First, get container info to rebuild it
    const containerInfo = await fetch(`/api/docker/containers/${containerId}/json`)
    if (!containerInfo.ok) {
      throw new Error('Failed to get container info for privacy reset')
    }
    
    const container = await containerInfo.json()
    
    // Stop the container if running
    if (container.State.Running) {
      await executeContainerAction(containerId, 'stop')
    }
    
    // Remove the container
    await executeContainerAction(containerId, 'remove')
    
    // Note: In a real implementation, you'd need to recreate the container
    // with the same configuration. This would require storing the original
    // docker-compose configuration or container creation parameters.
    throw new Error('Privacy reset completed. Please restart the container from your docker-compose file to complete the reset.')
  }

  const response = await fetch(`/api/docker/containers/${containerId}/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to ${action} container: ${errorText}`)
  }
}

export const formatUptime = (created: number): string => {
  const now = Date.now() / 1000
  const uptime = now - created
  
  if (uptime < 3600) {
    return `${Math.floor(uptime / 60)}m`
  } else if (uptime < 86400) {
    return `${Math.floor(uptime / 3600)}h`
  } else {
    return `${Math.floor(uptime / 86400)}d`
  }
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export const parseImageName = (fullImage: string): { name: string; tag: string } => {
  const parts = fullImage.split(':')
  if (parts.length === 1) {
    return { name: fullImage, tag: 'latest' }
  }
  const tag = parts.pop() || 'latest'
  const name = parts.join(':')
  return { name, tag }
}

// Icon logic removed - use CSS classes instead

export const fetchContainerStats = async (containerId: string): Promise<ContainerStats> => {
  const response = await fetch(`/api/docker/containers/${containerId}/stats?stream=false`)
  if (!response.ok) {
    throw new Error(`Failed to fetch container stats: ${response.status}`)
  }
  return response.json()
}

export const calculateCpuPercent = (stats: ContainerStats): number => {
  const { cpu_stats, precpu_stats } = stats
  
  const cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage
  const systemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage
  
  if (systemDelta > 0 && cpuDelta > 0) {
    return (cpuDelta / systemDelta) * 100
  }
  return 0
}

export const calculateMemoryPercent = (stats: ContainerStats): number => {
  const { memory_stats } = stats
  if (memory_stats.limit > 0) {
    return (memory_stats.usage / memory_stats.limit) * 100
  }
  return 0
}