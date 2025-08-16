import { call, put, takeLatest } from 'redux-saga/effects'

import { fetchSystemMetrics } from '@/api/fetchSystemMetrics'
import { MetricsActionTypes, SystemMetrics } from '@/store/metrics/types'
import {
    setMetricsStatus,
    fetchMetricsSuccess,
    fetchMetricsFailure,
} from '@/store/metrics/metricsSlice'

function* fetchMetricsSaga() {
    console.log('fetchMetricsSaga started')
    try {
        yield put(setMetricsStatus('LOADING'))

        const data: SystemMetrics = yield call(fetchSystemMetrics)
        console.log('Metrics data received:', data)
        const timestamp = Date.now()

        yield put(fetchMetricsSuccess({ data, timestamp }))
        console.log('Metrics success action dispatched')
    } catch (error: any) {
        console.error('Metrics fetch error:', error)
        const timestamp = Date.now()
        const errorMessage = error.message || 'Failed to fetch metrics'

        yield put(fetchMetricsFailure({ error: errorMessage, timestamp }))
    }
}

function* watchMetricsSaga() {
    yield takeLatest(MetricsActionTypes.FETCH_METRICS_REQUEST, fetchMetricsSaga)
}

export default watchMetricsSaga
