import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MetricsState, MetricsStatus, SystemMetrics } from './types'

const initialState: MetricsState = {
    status: 'UNKNOWN',
    data: null,
    lastUpdated: null,
    error: null,
}

const metricsSlice = createSlice({
    name: 'metrics',
    initialState,
    reducers: {
        setMetricsStatus: (state, action: PayloadAction<MetricsStatus>) => {
            state.status = action.payload
        },
        fetchMetricsSuccess: (state, action: PayloadAction<{ data: SystemMetrics; timestamp: number }>) => {
            state.data = action.payload.data
            state.lastUpdated = action.payload.timestamp
            state.status = 'READY'
            state.error = null
        },
        fetchMetricsFailure: (state, action: PayloadAction<{ error: string; timestamp: number }>) => {
            state.status = 'ERROR'
            state.error = action.payload.error
            state.lastUpdated = action.payload.timestamp
        },
        clearMetricsError: (state) => {
            state.error = null
        },
    },
})

export const {
    setMetricsStatus,
    fetchMetricsSuccess,
    fetchMetricsFailure,
    clearMetricsError,
} = metricsSlice.actions

export default metricsSlice.reducer

