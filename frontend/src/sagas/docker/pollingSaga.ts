import { put, take, fork, cancel, delay } from 'redux-saga/effects'
import { Task } from 'redux-saga'
import { PayloadAction } from '@reduxjs/toolkit'
import { updatePollingStatus, containerPollTick } from '@/store/docker/containerSlice'
import { ContainerActionTypes } from './types'
import { logger } from '@/utils/logger'
import type { PollingConfig } from './types'

// Polling Task - Optimized with less aggressive polling
function* containerPollingTask(pollInterval: number): Generator {
    // Ensure minimum 5 second interval to prevent excessive API calls
    const safeInterval = Math.max(pollInterval, 5000)
    logger.debug('Starting container polling', { requestedInterval: pollInterval, actualInterval: safeInterval })
    
    try {
        while (true) {
            yield put(updatePollingStatus({
                isPolling: true,
                pollInterval: safeInterval
            }))

            yield delay(safeInterval)
            logger.debug('Polling tick - refreshing containers')
            yield put(containerPollTick())
            yield put({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST })
        }
    } finally {
        logger.debug('Container polling stopped')
        yield put(updatePollingStatus({ isPolling: false }))
    }
}

// Polling Watcher
function* startPollingWatcher(): Generator {
    logger.info('Container polling watcher started')
    let pollingTask: Task | null = null

    while (true) {
        logger.debug('Waiting for START_CONTAINER_POLLING action...')
        const action: PayloadAction<PollingConfig> = yield take(ContainerActionTypes.START_CONTAINER_POLLING)
        logger.debug('START_CONTAINER_POLLING action received', action.payload)

        // Cancel existing polling task if any
        if (pollingTask) {
            yield cancel(pollingTask)
            logger.debug('Cancelled existing polling task')
        }

        // Start new polling task with default 15 second interval (was 10, now less aggressive)
        const interval = action.payload?.interval || 15000
        logger.info('Starting container polling', { interval })
        pollingTask = yield fork(containerPollingTask, interval)

        // Wait for stop action
        yield take(ContainerActionTypes.STOP_CONTAINER_POLLING)

        if (pollingTask) {
            yield cancel(pollingTask)
            pollingTask = null
            logger.info('Container polling stopped by user')
        }
    }
}

export { startPollingWatcher }
