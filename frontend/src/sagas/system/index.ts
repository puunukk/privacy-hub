import { takeLatest, takeEvery } from 'redux-saga/effects'

import { SystemInfoActionTypes } from '@/store/systemInfo/types'
import { SystemActionTypes } from './types'
import { loadSystemInfoSaga } from './loadSystemInfoSaga'
import { systemPowerSaga } from './systemPowerSaga'

export default function* systemSaga(): Generator {
    yield takeLatest(SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST, loadSystemInfoSaga)

    // Single saga for all system power commands
    yield takeEvery([
        SystemActionTypes.SYSTEM_SHUTDOWN_REQUEST,
        SystemActionTypes.SYSTEM_REBOOT_REQUEST,
        SystemActionTypes.SYSTEM_FORCE_SHUTDOWN_REQUEST
    ], systemPowerSaga)
}
