import { call, put } from 'redux-saga/effects'

import { fetchSystemInfo } from '@/api/fetchSystemInfo'
import { fetchSystemDebug } from '@/api/fetchSystemDebug'
import {
    fetchSystemInfoSuccess,
    fetchSystemInfoFailure
} from '@/store/systemInfo/systemInfoSlice'
import { logger } from '@/utils/logger'

export function* loadSystemInfoSaga(): Generator {
    const timerId = `SystemInfo fetch ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    logger.debug('loadSystemInfoSaga started')
    logger.time(timerId)

    try {
        const info: any = yield call(fetchSystemInfo)
        const debug: any = yield call(fetchSystemDebug)
        logger.debug('System info received:', { info, debug })
        yield put(fetchSystemInfoSuccess({ data: { ...info, ...debug }, timestamp: Date.now() }))
        logger.debug('System info success action dispatched')
    }
    catch (error) {
        logger.error('System info fetch error:', error)
        const timestamp = Date.now()
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch system info'
        yield put(fetchSystemInfoFailure({ error: errorMessage, timestamp }))
    }
    finally {
        logger.timeEnd(timerId)
    }
}