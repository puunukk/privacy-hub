import { takeEvery, fork } from 'redux-saga/effects'

import { AppConfigActionTypes } from '@/store/appConfig/types'

import { setThemeSaga } from './themeSaga'
import { autoHideNotificationSaga, cleanupExpiredNotificationsSaga } from './notificationSaga'
import { autoInitializeSaga } from './autoInitializeSaga'

export default function* appConfigSagas(): Generator {
    // Auto-initialize on startup
    yield fork(autoInitializeSaga)
    
    // Start background tasks
    yield fork(cleanupExpiredNotificationsSaga)

    // Handle actions
    yield takeEvery(AppConfigActionTypes.SET_THEME, setThemeSaga)
    yield takeEvery(AppConfigActionTypes.SHOW_NOTIFICATION, autoHideNotificationSaga)
}
