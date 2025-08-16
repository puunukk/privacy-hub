import { apiClient } from '@/api/apiClient'
import type { DockerInfo } from '@/types/docker'

const endpoint = '/api/docker/info'

export async function fetchDockerInfo(): Promise<DockerInfo | null> {
    console.log('fetchDockerInfo called')
    const response = await apiClient<DockerInfo>(endpoint)
    console.log('Docker info API response:', response)

    if (!response.success) {
        console.warn('Docker API not accessible:', response.error)
        return null
    }

    const result = response.data || null
    console.log('Docker info result:', result)
    return result
}
