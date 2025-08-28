import { call, put } from 'redux-saga/effects'
import { fetchSystemMetrics } from '@/api/fetchSystemMetrics'
import { setMetrics, setMetricsStatus } from '@/store/metrics/metricsSlice'
import { logger } from '@/utils/logger'

function* loadSystemMetricsSaga(): Generator<any, void, any> {
    const timerId = `SystemMetrics fetch ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    logger.debug('loadSystemMetricsSaga started')
    logger.time(timerId)
    
    try {
        yield put(setMetricsStatus({ status: 'LOADING' }))
        
        const data = yield call(fetchSystemMetrics)
        logger.debug('System metrics received:', data)
        
        yield put(setMetrics({ data, timestamp: Date.now() }))
        yield put(setMetricsStatus({ status: 'READY' }))
        
    } catch (error) {
        logger.error('System metrics fetch error:', error)
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch metrics'
        yield put(setMetricsStatus({ status: 'ERROR', error: errorMessage }))
    } finally {
        logger.timeEnd(timerId)
    }
}

export { loadSystemMetricsSaga }