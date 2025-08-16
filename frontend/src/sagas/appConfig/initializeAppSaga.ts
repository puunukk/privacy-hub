import { put, delay } from 'redux-saga/effects'

import { initializeApp, setTheme, setAppStatus } from '@/store/appConfig/appConfigSlice'
import { ContainerActionTypes } from '@/store/docker/types'
import { applyTheme } from './applyTheme'

function* initializeAppSaga(): Generator {
    try {
        // Set status to initializing
        yield put(setAppStatus("INITIALIZING"))

        // Initialize theme from localStorage or default to auto
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null
        const themeToUse = savedTheme || 'auto'

        // Apply the theme
        yield* applyTheme(themeToUse)
        yield put(setTheme({ theme: themeToUse }))

        // Mark app as initialized
        yield put(initializeApp())

        // Start optional data fetching in background
        try {
            // Load initial Docker data
            yield delay(1000)
            yield put({ type: ContainerActionTypes.LOAD_DOCKER_DATA_REQUEST })

            // Start auto-refresh after initial load
            yield delay(2000)
            yield put({ type: ContainerActionTypes.START_AUTO_REFRESH, payload: { interval: 10000 } })
        } catch (dataError) {
            console.warn('Some data fetching failed, but app will continue to work:', dataError)
        }

        // Set status to ready
        yield put(setAppStatus("READY"))

    } catch (error) {
        console.error('Failed to initialize app:', error)
        // Still mark as initialized so UI can render
        yield put(initializeApp())
        yield put(setAppStatus("ERROR"))
    }
}

export { initializeAppSaga }
