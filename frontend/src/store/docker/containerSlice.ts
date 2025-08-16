import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type {
  ContainerState,
  FetchContainersSuccessPayload,
  FetchContainersFailurePayload,
  FetchDockerInfoSuccessPayload,
  FetchDockerInfoFailurePayload,
  ExecuteContainerActionRequestPayload,
  ExecuteContainerActionSuccessPayload,
  ExecuteContainerActionFailurePayload,
  SetConnectionStatusPayload
} from './types'

const initialState: ContainerState = {
  containers: [],
  dockerInfo: null,
  isLoading: false,
  isExecutingAction: false,
  actionLoadingContainerId: null,
  isConnected: false,
  isAutoRefreshing: false,
  autoRefreshInterval: 10000,
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
    fetchContainersRequest: (state: ContainerState) => {
      state.isLoading = true
      state.error = null
      state.totalRequests += 1
    },

    fetchContainersSuccess: (state: ContainerState, action: PayloadAction<FetchContainersSuccessPayload>) => {
      state.containers = action.payload.containers
      state.isLoading = false
      state.isConnected = true
      state.error = null
      state.lastUpdateTime = action.payload.timestamp
    },

    fetchContainersFailure: (state: ContainerState, action: PayloadAction<FetchContainersFailurePayload>) => {
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

    fetchDockerInfoSuccess: (state: ContainerState, action: PayloadAction<FetchDockerInfoSuccessPayload>) => {
      state.dockerInfo = action.payload.dockerInfo
      state.lastUpdateTime = action.payload.timestamp
    },

    fetchDockerInfoFailure: (state: ContainerState, action: PayloadAction<FetchDockerInfoFailurePayload>) => {
      state.lastError = action.payload.error
      state.lastErrorTime = action.payload.timestamp
    },

    // Container Actions
    executeContainerActionRequest: (state: ContainerState, action: PayloadAction<ExecuteContainerActionRequestPayload>) => {
      state.isExecutingAction = true
      state.actionLoadingContainerId = action.payload.containerId
      state.error = null
    },

    executeContainerActionSuccess: (state: ContainerState, action: PayloadAction<ExecuteContainerActionSuccessPayload>) => {
      state.isExecutingAction = false
      state.actionLoadingContainerId = null
      state.lastUpdateTime = action.payload.timestamp
    },

    executeContainerActionFailure: (state: ContainerState, action: PayloadAction<ExecuteContainerActionFailurePayload>) => {
      state.isExecutingAction = false
      state.actionLoadingContainerId = null
      state.error = action.payload.error
      state.lastError = action.payload.error
      state.lastErrorTime = action.payload.timestamp
    },

    // Connection Status
    setConnectionStatus: (state: ContainerState, action: PayloadAction<SetConnectionStatusPayload>) => {
      state.isConnected = action.payload.isConnected
    },

    // Loading Status
    setLoadingStatus: (state: ContainerState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    // Auto-refresh Control
    startAutoRefresh: (state: ContainerState, action: PayloadAction<{ interval?: number }>) => {
      state.isAutoRefreshing = true
      if (action.payload.interval) {
        state.autoRefreshInterval = action.payload.interval
      }
    },

    stopAutoRefresh: (state: ContainerState) => {
      state.isAutoRefreshing = false
    },

    // Polling Control
    updatePollingStatus: (state: ContainerState, action: PayloadAction<{ isPolling: boolean; pollInterval?: number }>) => {
      state.isPolling = action.payload.isPolling
      if (action.payload.pollInterval) {
        state.pollInterval = action.payload.pollInterval
      }
    },

    containerPollTick: (state: ContainerState) => {
      state.nextPollTime = Date.now() + state.pollInterval
    },

    // Clear Errors
    clearError: (state: ContainerState) => {
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
  setLoadingStatus,
  startAutoRefresh,
  stopAutoRefresh,
  updatePollingStatus,
  containerPollTick,
  clearError,
  resetContainerState,
} = containerSlice.actions

export default containerSlice.reducer
