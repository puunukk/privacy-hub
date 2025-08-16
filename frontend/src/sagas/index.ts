import { all, fork } from 'redux-saga/effects'

import containerSaga from './docker'
import systemSaga from './system'
import appConfigSagas from './appConfig'
import metricsSaga from './system/metricsSaga'

export default function* rootSaga() {
    yield all([
        fork(containerSaga),
        fork(systemSaga),
        fork(appConfigSagas),
        fork(metricsSaga),
    ])
}
