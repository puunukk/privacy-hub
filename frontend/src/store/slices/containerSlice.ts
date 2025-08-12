import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { DockerContainer, DockerInfo } from '../../types/docker'

export interface ContainerState {
  // Data
  containers: DockerContainer[]
  dockerInfo: DockerInfo | null
  
  // Loading States
  isLoading: boolean
  isExecutingAction: boolean
  actionLoadingContainerId: string | null
  
  // Connection Status
  isConnected: boolean
  isPolling: boolean
  pollInterval: number
  nextPollTime: number | null
  
  // Statistics
  totalRequests: number
  failedRequests: number
  lastUpdateTime: number | null
  lastErrorTime: number | null
  
  // Errors
  error: string | null
  lastError: string | null
}

const initialState: ContainerState = {
  containers: [],
  dockerInfo: null,
  isLoading: false,
  isExecutingAction: false,
  actionLoadingContainerId: null,
  isConnected: false,
  isPolling: false,
  pollInterval: 10000,
  nextPollTime: null,
  totalRequests: 0,
  failedRequests: 0,
  lastUpdateTime: null,
  lastErrorTime: null,
  error: null,
  lastError: null,
}

const containerSlice = createSlice({
  name: 'containers',
  initialState,
  reducers: {
    // Fetch Containers
    fetchContainersRequest: (state) => {
      state.isLoading = true
      state.error = null
      state.totalRequests += 1
    },
    
    fetchContainersSuccess: (state, action: PayloadAction<{
      containers: DockerContainer[]
      timestamp: number
    }>) => {
      state.containers = action.payload.containers
      state.isLoading = false
      state.isConnected = true
      state.error = null
      state.lastUpdateTime = action.payload.timestamp
    },
    
    fetchContainersFailure: (state, action: PayloadAction<{
      error: string
      timestamp: number
    }>) => {
      state.isLoading = false
      state.error = action.payload.error
      state.lastError = action.payload.error
      state.lastErrorTime = action.payload.timestamp
      state.failedRequests += 1
    },

    // Fetch Docker Info
    fetchDockerInfoRequest: () => {
      // Docker info requests are usually bundled with container requests
      // so we don't set loading state here to avoid conflicts
    },
    
    fetchDockerInfoSuccess: (state, action: PayloadAction<{
      dockerInfo: DockerInfo
      timestamp: number
    }>) => {
      state.dockerInfo = action.payload.dockerInfo
      state.lastUpdateTime = action.payload.timestamp
    },
    
    fetchDockerInfoFailure: (state, action: PayloadAction<{
      error: string
      timestamp: number
    }>) => {
      state.lastError = action.payload.error
      state.lastErrorTime = action.payload.timestamp
    },

    // Container Actions
    executeContainerActionRequest: (state, action: PayloadAction<{
      containerId: string
      action: string
      containerName?: string
    }>) => {
      state.isExecutingAction = true
      state.actionLoadingContainerId = action.payload.containerId
      state.error = null
    },
    
    executeContainerActionSuccess: (state, action: PayloadAction<{
      containerId: string
      action: string
      timestamp: number
    }>) => {
      state.isExecutingAction = false
      state.actionLoadingContainerId = null
      state.lastUpdateTime = action.payload.timestamp
    },
    
    executeContainerActionFailure: (state, action: PayloadAction<{
      containerId: string
      action: string
      error: string
      timestamp: number
    }>) => {
      state.isExecutingAction = false
      state.actionLoadingContainerId = null
      state.error = action.payload.error
      state.lastError = action.payload.error
      state.lastErrorTime = action.payload.timestamp
    },

    // Connection Status
    setConnectionStatus: (state, action: PayloadAction<{
      isConnected: boolean
      error?: string
    }>) => {
      state.isConnected = action.payload.isConnected
      if (action.payload.error) {
        state.error = action.payload.error
        state.lastError = action.payload.error
        state.lastErrorTime = Date.now()
      }
      if (!action.payload.isConnected) {
        state.isPolling = false
        state.nextPollTime = null
      }
    },

    // Polling Status
    updatePollingStatus: (state, action: PayloadAction<{
      isPolling: boolean
      nextPollTime?: number
      interval?: number
    }>) => {
      state.isPolling = action.payload.isPolling
      if (action.payload.nextPollTime !== undefined) {
        state.nextPollTime = action.payload.nextPollTime
      }
      if (action.payload.interval !== undefined) {
        state.pollInterval = action.payload.interval
      }
    },

    // Polling tick
    containerPollTick: () => {
      // This is just a trigger action for saga, no state changes needed
    },

    // Clear Errors
    clearError: (state) => {
      state.error = null
    },

    // Reset State (for testing/debugging)
    resetContainerState: () => initialState,
  },
})

export const {
  fetchContainersRequest,
  fetchContainersSuccess,
  fetchContainersFailure,
  fetchDockerInfoRequest,
  fetchDockerInfoSuccess,
  fetchDockerInfoFailure,
  executeContainerActionRequest,
  executeContainerActionSuccess,
  executeContainerActionFailure,
  setConnectionStatus,
  updatePollingStatus,
  containerPollTick,
  clearError,
  resetContainerState,
} = containerSlice.actions

export default containerSlice.reducer
