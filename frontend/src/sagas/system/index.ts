import { takeEvery, takeLatest } from 'redux-saga/effects'

import { SystemActionTypes } from './types'
import { SystemInfoActionTypes } from '@/store/systemInfo/types'
import { MetricsActionTypes } from '@/store/metrics/types'
import { systemPowerSaga } from './systemPowerSaga'
import { loadSystemInfoSaga } from './loadSystemInfoSaga'
import { loadSystemMetricsSaga } from './loadSystemMetricsSaga'

export default function* systemSaga(): Generator<any, void, any> {
    // System power commands
    yield takeEvery([
        SystemActionTypes.SYSTEM_SHUTDOWN_REQUEST,
        SystemActionTypes.SYSTEM_REBOOT_REQUEST,
        SystemActionTypes.SYSTEM_FORCE_SHUTDOWN_REQUEST
    ], systemPowerSaga)
    
    // Handle direct fetch requests (for initial load and manual refresh)
    yield takeLatest(SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST, loadSystemInfoSaga)
    yield takeLatest(MetricsActionTypes.FETCH_METRICS_REQUEST, loadSystemMetricsSaga)
    
    // NOTE: Continuous polling is handled by UnifiedLoopManager
    // These listeners are for initial loads and manual refreshes only
}
