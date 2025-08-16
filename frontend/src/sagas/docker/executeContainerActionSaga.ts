import { call, put } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'

import { executeContainerAction } from '@/api/executeContainerAction'
import {
    executeContainerActionSuccess,
    executeContainerActionFailure
} from '@/store/docker/containerSlice'
import { showNotification } from '@/store/appConfig/appConfigSlice'
import { ContainerActionTypes } from '@/store/docker/types'
import type { ExecuteContainerActionPayload } from './types'

function* executeContainerActionSaga(action: PayloadAction<ExecuteContainerActionPayload>) {
    const { containerId, action: containerAction, containerName } = action.payload

    try {
        yield call(executeContainerAction, containerId, containerAction)

        const timestamp = Date.now()
        yield put(executeContainerActionSuccess({
            containerId,
            action: containerAction,
            timestamp
        }))

        // Show success notification
        yield put(showNotification({
            id: `action-success-${containerId}-${timestamp}`,
            type: 'success',
            title: 'Container Action Successful',
            message: `Successfully executed "${containerAction}" on ${containerName || 'container'}`,
            duration: 3000,
            timestamp: timestamp,
        }))

        // Refresh containers after successful action
        yield put({ type: ContainerActionTypes.LOAD_DOCKER_DATA_REQUEST })

    } catch (error) {
        const timestamp = Date.now()
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        yield put(executeContainerActionFailure({
            containerId,
            action: containerAction,
            error: errorMessage,
            timestamp
        }))

        // Show error notification
        yield put(showNotification({
            id: `action-error-${containerId}-${timestamp}`,
            type: 'error',
            title: 'Container Action Failed',
            message: errorMessage,
            duration: 5000,
            timestamp: timestamp,
        }))
    }
}

export { executeContainerActionSaga }
