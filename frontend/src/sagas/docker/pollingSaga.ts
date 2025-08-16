import { put, take, fork, cancel, delay } from 'redux-saga/effects'
import { Task } from 'redux-saga'
import { PayloadAction } from '@reduxjs/toolkit'
import { updatePollingStatus, containerPollTick } from '@/store/docker/containerSlice'
import { ContainerActionTypes } from './types'
import type { PollingConfig } from './types'

// Polling Task
function* containerPollingTask(pollInterval: number): Generator {
    try {
        while (true) {
            yield put(updatePollingStatus({
                isPolling: true,
                pollInterval
            }))

            yield delay(pollInterval)
            yield put(containerPollTick())
            yield put({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST })
        }
    } finally {
        yield put(updatePollingStatus({ isPolling: false }))
    }
}

// Polling Watcher
function* startPollingWatcher(): Generator {
    console.log('startPollingWatcher started')
    let pollingTask: Task | null = null

    while (true) {
        console.log('Waiting for START_CONTAINER_POLLING action...')
        const action: PayloadAction<PollingConfig> = yield take(ContainerActionTypes.START_CONTAINER_POLLING)
        console.log('START_CONTAINER_POLLING action received:', action)

        // Cancel existing polling task if any
        if (pollingTask) {
            yield cancel(pollingTask)
        }

        // Start new polling task
        const interval = action.payload?.interval || 10000
        console.log('Starting container polling with interval:', interval)
        pollingTask = yield fork(containerPollingTask, interval)

        // Wait for stop action
        yield take(ContainerActionTypes.STOP_CONTAINER_POLLING)

        if (pollingTask) {
            yield cancel(pollingTask)
            pollingTask = null
        }
    }
}

export { startPollingWatcher }
