import { apiClient } from '@/api/apiClient'

const endpoint = '/api/pi-system/cmd'

export async function executeSystemCmd(command: string): Promise<void> {
    const response = await apiClient(`${endpoint}/${command}`, {
        method: 'POST'
    })

    if (!response.success) {
        throw new Error(`Failed to execute system command: ${response.error}`)
    }

    //if (response.status === 'shutdown_initiated') {
    //    throw new Error('System is shutting down. Please try again later.')
    //}

    if (!response.success) {
        throw new Error(`Failed to shutdown system: ${response.error}`)
    }
}
