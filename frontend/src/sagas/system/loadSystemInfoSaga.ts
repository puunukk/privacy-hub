import { call, put } from 'redux-saga/effects'

import { fetchSystemInfo } from '@/api/fetchSystemInfo'
import { fetchSystemDebug } from '@/api/fetchSystemDebug'
import {
    fetchSystemInfoSuccess,
    fetchSystemInfoFailure
} from '@/store/systemInfo/systemInfoSlice'
import { logger } from '@/utils/logger'

function* loadSystemInfoSaga(): Generator {
    logger.debug('loadSystemInfoSaga started')
    logger.time('SystemInfo fetch')

    try {
        const info: any = yield call(fetchSystemInfo)
        const debug: any = yield call(fetchSystemDebug)
        logger.debug('System info received:', { info, debug })
        yield put(fetchSystemInfoSuccess({ data: { ...info, ...debug }, timestamp: Date.now() }))
        logger.debug('System info success action dispatched')
        logger.timeEnd('SystemInfo fetch')
    } catch (error) {
        logger.error('System info fetch error:', error)
        logger.timeEnd('SystemInfo fetch')
        const timestamp = Date.now()
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch system info'
        yield put(fetchSystemInfoFailure({ error: errorMessage, timestamp }))
    }
}

export { loadSystemInfoSaga }
