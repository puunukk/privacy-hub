import { put } from 'redux-saga/effects'
import type { PutEffect } from 'redux-saga/effects'

import { LoopManagerActionTypes } from '../unifiedLoopManager'
import { setTheme, initializeApp, setAppStatus } from '@/store/appConfig/appConfigSlice'
import { ContainerActionTypes } from '@/store/docker/types'
import { MetricsActionTypes } from '@/store/metrics/types'
import { SystemInfoActionTypes } from '@/store/systemInfo/types'
import type { Theme } from '@/store/appConfig/types'
import { logger } from '@/utils/logger'

/**
 * Auto-initializes app on startup - runs once when saga starts
 */
export function* autoInitializeSaga(): Generator<PutEffect, void, unknown> {
    logger.info('🚀 Auto-initializing app...')

    // Set status
    yield put(setAppStatus('INITIALIZING'))

    // Initialize theme from localStorage (reducer handles DOM update)
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const themeToUse: Theme = savedTheme || 'auto'
    logger.debug(`🎨 Setting theme: ${themeToUse}`)
    yield put(setTheme({ theme: themeToUse }))

    // Mark app as initialized
    yield put(initializeApp())

    // Trigger initial data fetches (loops will take over after)
    logger.info('📊 Triggering initial data loads...')
    yield put({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST })
    yield put({ type: MetricsActionTypes.FETCH_METRICS_REQUEST })
    yield put({ type: SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST })
    yield put({ type: ContainerActionTypes.FETCH_DOCKER_INFO_REQUEST })

    // Start loop manager
    logger.info('🔄 Starting Unified Loop Manager...')
    yield put({ type: LoopManagerActionTypes.INITIALIZE_LOOPS })

    // App ready
    yield put(setAppStatus('READY'))
    logger.info('✅ App auto-initialization complete')
}