import { call, put } from 'redux-saga/effects'

import { fetchSystemInfo } from '@/api/fetchSystemInfo'
import {
    fetchSystemInfoSuccess,
    fetchSystemInfoFailure
} from '@/store/systemInfo/systemInfoSlice'

function* loadSystemInfoSaga(): Generator {
    console.log('loadSystemInfoSaga started')

    try {
        const info: any = yield call(fetchSystemInfo)
        console.log('System info received:', info)
        yield put(fetchSystemInfoSuccess({ data: info, timestamp: Date.now() }))
        console.log('System info success action dispatched')
    } catch (error) {
        console.error('System info fetch error:', error)
        const timestamp = Date.now()
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch system info'
        yield put(fetchSystemInfoFailure({ error: errorMessage, timestamp }))
    }
}

export { loadSystemInfoSaga }
