import { apiClient } from '@/api/apiClient'

const endpoint = '/pi-system/debug'

export async function fetchSystemDebug(): Promise<any> {
    console.log('fetchSystemDebug called')
    const response = await apiClient(endpoint)
    console.log('System debug API response:', response)

    if (!response.success) {
        throw new Error(`Failed to fetch system debug: ${response.error}`)
    }

    const result = response.data || response
    console.log('System debug result:', result)
    return result
}
