import { apiClient } from '@/api/apiClient'

const endpoint = '/api/pi-system/metrics'

export async function fetchSystemMetrics(): Promise<any> {
    console.log('fetchSystemMetrics called')
    const response = await apiClient(endpoint, {
        cache: 'no-store'
    })
    console.log('Metrics API response:', response)

    if (!response.success) {
        throw new Error(`Failed to fetch system metrics: ${response.error}`)
    }

    const result = response.data
    console.log('Metrics result:', result)
    return result
}
