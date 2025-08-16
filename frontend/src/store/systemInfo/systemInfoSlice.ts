import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SystemInfoState, SystemInfoStatus, SystemInfo } from './types'

const initialState: SystemInfoState = {
    status: 'UNKNOWN',
    data: null,
    lastUpdated: null,
    error: null,
}

const systemInfoSlice = createSlice({
    name: 'systemInfo',
    initialState,
    reducers: {
        setSystemInfoStatus: (state, action: PayloadAction<SystemInfoStatus>) => {
            state.status = action.payload
        },
        fetchSystemInfoSuccess: (state, action: PayloadAction<{ data: SystemInfo; timestamp: number }>) => {
            state.data = action.payload.data
            state.lastUpdated = action.payload.timestamp
            state.status = 'READY'
            state.error = null
        },
        fetchSystemInfoFailure: (state, action: PayloadAction<{ error: string; timestamp: number }>) => {
            state.status = 'ERROR'
            state.error = action.payload.error
            state.lastUpdated = action.payload.timestamp
        },
        clearSystemInfoError: (state) => {
            state.error = null
        },
    },
})

export const {
    setSystemInfoStatus,
    fetchSystemInfoSuccess,
    fetchSystemInfoFailure,
    clearSystemInfoError,
} = systemInfoSlice.actions

export default systemInfoSlice.reducer
