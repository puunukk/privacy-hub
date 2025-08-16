import { put, select } from 'redux-saga/effects'
import { showNotification } from '@/store/appConfig/appConfigSlice'
import { ContainerActionTypes } from './types'
import type { RootState } from '@/store'

function* restartNginxSaga(): Generator {
    try {
        // Get current containers to find nginx
        const state: RootState = yield select()
        const nginxContainer = state.containers.containers.find((container: any) =>
            container.Names.some((name: any) => name.includes('nginx')) ||
            container.Image.toLowerCase().includes('nginx')
        )

        if (!nginxContainer) {
            throw new Error('Nginx container not found')
        }

        yield put({
            type: ContainerActionTypes.EXECUTE_CONTAINER_ACTION_REQUEST,
            payload: {
                containerId: nginxContainer.Id,
                action: 'restart',
                containerName: 'nginx',
            }
        })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to restart nginx'
        yield put(showNotification({
            id: `nginx-error-${Date.now()}`,
            type: 'error',
            title: 'Nginx Restart Failed',
            message: errorMessage,
            duration: 5000,
            timestamp: Date.now(),
        }))
    }
}

export { restartNginxSaga }
