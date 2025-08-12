import { call, put, takeLatest } from 'redux-saga/effects'
import { NetworkActionTypes } from '../actions/types'
import {
  fetchNetworkInfoSuccess,
  fetchNetworkInfoFailure,
} from '../slices/networkSlice'
import { detectRealNetworkInfo, type RealNetworkInfo } from '../../utils/network'

function* fetchNetworkInfoSaga() {
  try {
    const networkInfo: RealNetworkInfo = yield call(detectRealNetworkInfo)
    const timestamp = Date.now()
    
    yield put(fetchNetworkInfoSuccess({ networkInfo, timestamp }))
    
  } catch (error) {
    const timestamp = Date.now()
    const errorMessage = error instanceof Error ? error.message : 'Failed to load network information'
    
    yield put(fetchNetworkInfoFailure({ error: errorMessage, timestamp }))
  }
}

export default function* networkSaga() {
  yield takeLatest(NetworkActionTypes.FETCH_NETWORK_INFO_REQUEST, fetchNetworkInfoSaga)
}
