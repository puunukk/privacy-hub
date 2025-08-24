import { apiClient } from '@/api/apiClient'

const endpoint = '/pi-system/info'

export async function fetchSystemInfo(): Promise<any> {
    console.log('fetchSystemInfo called')
    const response = await apiClient(endpoint)
    console.log('System info API response:', response)

    if (!response.success) {
        throw new Error(`Failed to fetch system info: ${response.error}`)
    }

    const result = response.data || response
    console.log('System info result:', result)
    return result
}
