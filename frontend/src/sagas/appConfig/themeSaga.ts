import { put } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'

import { setTheme } from '@/store/appConfig/appConfigSlice'
import { applyTheme } from './applyTheme'

function* setThemeSaga(action: PayloadAction<{ theme: 'light' | 'dark' | 'auto' }>): Generator {
    const { theme } = action.payload

    try {
        // Update Redux store first
        yield put(setTheme({ theme }))

        // Apply theme to DOM
        yield* applyTheme(theme)

        // Save to localStorage
        localStorage.setItem('theme', theme)
    } catch (error) {
        console.error('Failed to set theme:', error)
    }
}

export { setThemeSaga }
