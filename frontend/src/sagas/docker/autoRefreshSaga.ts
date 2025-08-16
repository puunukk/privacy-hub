import { put, take, delay, fork } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'

import { ContainerActionTypes } from '@/store/docker/types'
import { startAutoRefresh, stopAutoRefresh } from '@/store/docker/containerSlice'

// Auto-refresh saga that handles the timing
function* autoRefreshTimerSaga(interval: number): Generator {
    while (true) {
        yield delay(interval)
        yield put({ type: ContainerActionTypes.AUTO_REFRESH_TICK })
    }
}

// Main auto-refresh watcher
function* autoRefreshWatcherSaga(): Generator {
    let timerTask: any = null

    while (true) {
        // Wait for start auto-refresh action
        const startAction: PayloadAction<{ interval?: number }> = yield take(ContainerActionTypes.START_AUTO_REFRESH)
        console.log('Auto-refresh started with interval:', startAction.payload.interval || 10000)

        // Update state
        yield put(startAutoRefresh(startAction.payload))

        // Start the timer
        const interval = startAction.payload.interval || 10000
        timerTask = yield fork(autoRefreshTimerSaga, interval)

        // Wait for stop auto-refresh action
        yield take(ContainerActionTypes.STOP_AUTO_REFRESH)
        console.log('Auto-refresh stopped')

        // Cancel the timer
        if (timerTask) {
            timerTask.cancel()
            timerTask = null
        }

        // Update state
        yield put(stopAutoRefresh())
    }
}

export default autoRefreshWatcherSaga
