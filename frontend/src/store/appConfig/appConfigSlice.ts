import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type {
    AppConfigState,
    ApplicationStatus,
    Notification,
    Theme,
    PollingIntervals
} from './types'

const initialState: AppConfigState = {
    isInitialized: false,
    status: "UNINITIALIZED",
    theme: 'auto',
    notifications: [],
    error: null,
    pollingIntervals: {
        containers: 15000,    // 15 seconds for container data
        metrics: 30000,       // 30 seconds for metrics  
        systemInfo: 60000     // 60 seconds for system info
    }
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
        updatePollingIntervals: (state, action: PayloadAction<Partial<PollingIntervals>>) => {
            state.pollingIntervals = { ...state.pollingIntervals, ...action.payload }
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
    updatePollingIntervals,
} = appConfigSlice.actions

export default appConfigSlice.reducer
