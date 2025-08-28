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
        setMetrics: (state, action: PayloadAction<{ data: SystemMetrics; timestamp: number }>) => {
            state.data = action.payload.data
            state.lastUpdated = action.payload.timestamp
            state.error = null
        },
        setMetricsStatus: (state, action: PayloadAction<{ status: MetricsStatus; error?: string }>) => {
            state.status = action.payload.status
            state.error = action.payload.error || null
        },
    },
})

export const {
    setMetrics,
    setMetricsStatus,
} = metricsSlice.actions

export default metricsSlice.reducer

