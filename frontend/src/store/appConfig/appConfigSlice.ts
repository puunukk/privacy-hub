import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type {
    AppConfigState,
    ApplicationStatus,
    Notification,
    Theme
} from './types'

const initialState: AppConfigState = {
    isInitialized: false,
    status: "UNINITIALIZED",
    theme: 'auto',
    notifications: [],
    error: null,
}

const appConfigSlice = createSlice({
    name: 'appConfig',
    initialState,
    reducers: {
        initializeApp: (state) => {
            state.isInitialized = true
        },
        setAppStatus: (state, action: PayloadAction<ApplicationStatus>) => {
            state.status = action.payload
        },
        setTheme: (state, action: PayloadAction<{ theme: Theme }>) => {
            state.theme = action.payload.theme
        },
        showNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.push(action.payload)
        },
        hideNotification: (state, action: PayloadAction<{ id: string }>) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload.id
            )
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
        },
        clearError: (state) => {
            state.error = null
        },
    },
})

export const {
    initializeApp,
    setAppStatus,
    setTheme,
    showNotification,
    hideNotification,
    setError,
    clearError,
} = appConfigSlice.actions

export default appConfigSlice.reducer
