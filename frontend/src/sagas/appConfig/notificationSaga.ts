import { put, delay, select } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'

import { hideNotification } from '@/store/appConfig/appConfigSlice'
import type { Notification } from '@/store/appConfig/types'
import type { RootState } from '@/store'

function* autoHideNotificationSaga(action: PayloadAction<Notification>): Generator {
    const { id, duration = 5000 } = action.payload

    // Auto-hide notification after duration
    if (duration > 0) {
        yield delay(duration)
        yield put(hideNotification({ id }))
    }
}

function* cleanupExpiredNotificationsSaga(): Generator {
    while (true) {
        yield delay(30000) // Check every 30 seconds

        const state: RootState = yield select()
        const now = Date.now()
        const expiredThreshold = 5 * 60 * 1000 // 5 minutes

        // Auto-remove notifications older than 5 minutes
        for (const notification of state.appConfig.notifications) {
            if (now - notification.timestamp > expiredThreshold) {
                yield put(hideNotification({ id: notification.id }))
            }
        }
    }
}

export { autoHideNotificationSaga, cleanupExpiredNotificationsSaga }
