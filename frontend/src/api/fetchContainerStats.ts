import { apiClient } from '@/api/apiClient'
import type { ContainerStats } from '@/types/docker'

const endpoint = '/api/docker/containers'

export async function fetchContainerStats(containerId: string): Promise<ContainerStats> {
    const response = await apiClient<ContainerStats>(`${endpoint}/${containerId}/stats?stream=false`)

    if (!response.success) {
        throw new Error(`Failed to fetch container stats: ${response.error}`)
    }

    return response.data!
}
