import { takeEvery, takeLatest, fork } from 'redux-saga/effects'

import { AppConfigActionTypes } from '@/store/appConfig/types'

import { initializeAppSaga } from './initializeAppSaga'
import { setThemeSaga } from './themeSaga'
import { autoHideNotificationSaga, cleanupExpiredNotificationsSaga } from './notificationSaga'

export default function* appConfigSagas(): Generator {
    // Start background tasks
    yield fork(cleanupExpiredNotificationsSaga)

    // Handle actions
    yield takeLatest(AppConfigActionTypes.INITIALIZE_APP, initializeAppSaga)
    yield takeEvery(AppConfigActionTypes.SET_THEME, setThemeSaga)
    yield takeEvery(AppConfigActionTypes.SHOW_NOTIFICATION, autoHideNotificationSaga)
}
