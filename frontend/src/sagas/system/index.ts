import { takeLatest } from 'redux-saga/effects'

import { SystemInfoActionTypes } from '@/store/systemInfo/types'
import { loadSystemInfoSaga } from './loadSystemInfoSaga'

export default function* systemSaga(): Generator {
    yield takeLatest(SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST, loadSystemInfoSaga)
}
