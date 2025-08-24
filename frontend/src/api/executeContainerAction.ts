import { apiClient } from '@/api/apiClient'
import type { ContainerAction } from '@/types/docker'

const endpoint = '/docker-api/containers'

export async function executeContainerAction(containerId: string, action: ContainerAction): Promise<void> {
    if (action === 'privacy_reset') {
        // Handle privacy reset specially
        const containerInfo = await apiClient(`${endpoint}/${containerId}/json`)
        if (!containerInfo.success) {
            throw new Error('Failed to get container info for privacy reset')
        }

        const container = containerInfo.data as any

        // Stop if running
        if (container.State.Running) {
            await executeContainerAction(containerId, 'stop')
        }

        // Remove container
        await executeContainerAction(containerId, 'remove')

        throw new Error('Privacy reset completed. Please restart the container from your docker-compose file.')
    }

    const response = await apiClient(`${endpoint}/${containerId}/${action}`, {
        method: 'POST',
    })

    if (!response.success) {
        throw new Error(`Failed to ${action} container: ${response.error}`)
    }
}
