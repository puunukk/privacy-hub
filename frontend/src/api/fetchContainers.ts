import { apiClient } from '@/api/apiClient'
import type { DockerContainer } from '@/types/docker'

const endpoint = '/docker-api/containers'

export async function fetchContainers(): Promise<DockerContainer[]> {
    console.log('fetchContainers called')
    const response = await apiClient<DockerContainer[]>(`${endpoint}/json?all=true`)
    console.log('Containers API response:', response)

    if (!response.success) {
        console.warn('Docker API not accessible:', response.error)
        return []
    }

    const result = response.data || []
    console.log('Containers result:', result)
    return result
}
