/**
 * Loops Redux Slice
 * 
 * Manages the state of all polling loops in the application.
 * Provides UI control over loop intervals and enable/disable status.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LoopState {
  enabled: boolean
  interval: number
  lastRun: number
  status: 'idle' | 'running' | 'error'
  errorCount: number
  successCount: number
}

export interface LoopsState {
  [loopId: string]: LoopState
}

// Initial state with default configurations
const initialState: LoopsState = {
  system_info: {
    enabled: true,
    interval: 300000,  // 5 minutes
    lastRun: 0,
    status: 'idle',
    errorCount: 0,
    successCount: 0
  },
  system_metrics: {
    enabled: true,
    interval: 5000,    // 5 seconds
    lastRun: 0,
    status: 'idle',
    errorCount: 0,
    successCount: 0
  },
  docker_containers: {
    enabled: true,
    interval: 15000,   // 15 seconds
    lastRun: 0,
    status: 'idle',
    errorCount: 0,
    successCount: 0
  },
  docker_stats: {
    enabled: false,    // Disabled - stats are auto-fetched with containers
    interval: 30000,   // 30 seconds
    lastRun: 0,
    status: 'idle',
    errorCount: 0,
    successCount: 0
  },
  docker_info: {
    enabled: true,
    interval: 120000,  // 2 minutes
    lastRun: 0,
    status: 'idle',
    errorCount: 0,
    successCount: 0
  },
  docker_networks: {
    enabled: false,    // Disabled by default - rarely needed
    interval: 300000,  // 5 minutes
    lastRun: 0,
    status: 'idle',
    errorCount: 0,
    successCount: 0
  },
  health_check: {
    enabled: true,
    interval: 30000,   // 30 seconds (will auto-adjust based on service status)
    lastRun: 0,
    status: 'idle',
    errorCount: 0,
    successCount: 0
  }
}

const loopsSlice = createSlice({
  name: 'loops',
  initialState,
  reducers: {
    // Toggle a loop on/off
    toggleLoop: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload
      if (state[id]) {
        state[id].enabled = !state[id].enabled
        if (!state[id].enabled) {
          state[id].status = 'idle'
        }
      }
    },
    
    // Update loop interval
    updateLoopInterval: (state, action: PayloadAction<{ id: string, interval: number }>) => {
      const { id, interval } = action.payload
      if (state[id]) {
        state[id].interval = interval
      }
    },
    
    // Update loop status
    updateLoopStatus: (state, action: PayloadAction<{
      id: string
      status?: 'idle' | 'running' | 'error'
      lastRun?: number
      errorCount?: number | '+1'
      successCount?: number | '+1'
    }>) => {
      const { id, status, lastRun, errorCount, successCount } = action.payload
      
      if (!state[id]) {
        // Create loop state if it doesn't exist
        state[id] = {
          enabled: false,
          interval: 30000,
          lastRun: 0,
          status: 'idle',
          errorCount: 0,
          successCount: 0
        }
      }
      
      if (status !== undefined) {
        state[id].status = status
      }
      
      if (lastRun !== undefined) {
        state[id].lastRun = lastRun
      }
      
      if (errorCount !== undefined) {
        if (errorCount === '+1') {
          state[id].errorCount += 1
        } else {
          state[id].errorCount = errorCount
        }
      }
      
      if (successCount !== undefined) {
        if (successCount === '+1') {
          state[id].successCount += 1
        } else {
          state[id].successCount = successCount
        }
      }
    },
    
    // Enable all loops
    enableAllLoops: (state) => {
      Object.keys(state).forEach(id => {
        state[id].enabled = true
      })
    },
    
    // Disable all loops
    disableAllLoops: (state) => {
      Object.keys(state).forEach(id => {
        state[id].enabled = false
        state[id].status = 'idle'
      })
    },
    
    // Reset loop statistics
    resetLoopStats: (state, action: PayloadAction<{ id?: string }>) => {
      const { id } = action.payload
      
      if (id && state[id]) {
        state[id].errorCount = 0
        state[id].successCount = 0
      } else {
        // Reset all if no ID specified
        Object.keys(state).forEach(loopId => {
          state[loopId].errorCount = 0
          state[loopId].successCount = 0
        })
      }
    },
    
    // Set loop configuration
    setLoopConfig: (state, action: PayloadAction<{
      id: string
      config: Partial<LoopState>
    }>) => {
      const { id, config } = action.payload
      
      if (!state[id]) {
        state[id] = {
          enabled: false,
          interval: 30000,
          lastRun: 0,
          status: 'idle',
          errorCount: 0,
          successCount: 0
        }
      }
      
      state[id] = { ...state[id], ...config }
    }
  }
})

export const {
  toggleLoop,
  updateLoopInterval,
  updateLoopStatus,
  enableAllLoops,
  disableAllLoops,
  resetLoopStats,
  setLoopConfig
} = loopsSlice.actions

export default loopsSlice.reducer

// Selectors
export const selectLoopState = (state: { loops: LoopsState }, loopId: string) => 
  state.loops[loopId]

export const selectAllLoops = (state: { loops: LoopsState }) => 
  state.loops

export const selectEnabledLoops = (state: { loops: LoopsState }) => 
  Object.entries(state.loops)
    .filter(([_, loop]) => loop.enabled)
    .map(([id]) => id)

export const selectLoopStats = (state: { loops: LoopsState }) => {
  const loops = state.loops
  const stats = {
    total: Object.keys(loops).length,
    enabled: 0,
    running: 0,
    errors: 0,
    totalRequests: 0,
    requestsPerHour: 0
  }
  
  Object.values(loops).forEach(loop => {
    if (loop.enabled) stats.enabled++
    if (loop.status === 'running') stats.running++
    if (loop.errorCount > 0) stats.errors++
    stats.totalRequests += loop.successCount + loop.errorCount
    
    // Calculate requests per hour based on interval
    if (loop.enabled && loop.interval > 0) {
      stats.requestsPerHour += (3600000 / loop.interval)
    }
  })
  
  return stats
}