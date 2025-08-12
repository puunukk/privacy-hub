import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Base selectors
export const selectContainerState = (state: RootState) => state.containers
export const selectContainers = (state: RootState) => state.containers.containers
export const selectDockerInfo = (state: RootState) => state.containers.dockerInfo
export const selectIsContainersLoading = (state: RootState) => state.containers.isLoading
export const selectContainerError = (state: RootState) => state.containers.error
export const selectActionLoadingContainerId = (state: RootState) => state.containers.actionLoadingContainerId

// Connection status selectors
export const selectIsConnected = (state: RootState) => state.containers.isConnected
export const selectIsPolling = (state: RootState) => state.containers.isPolling
export const selectPollInterval = (state: RootState) => state.containers.pollInterval
export const selectNextPollTime = (state: RootState) => state.containers.nextPollTime
export const selectLastUpdateTime = (state: RootState) => state.containers.lastUpdateTime

// Statistics selectors
export const selectTotalRequests = (state: RootState) => state.containers.totalRequests
export const selectFailedRequests = (state: RootState) => state.containers.failedRequests
export const selectLastError = (state: RootState) => state.containers.lastError
export const selectLastErrorTime = (state: RootState) => state.containers.lastErrorTime

// Computed selectors
export const selectRunningContainers = createSelector(
  [selectContainers],
  (containers) => containers.filter(container => container.State === 'running')
)

export const selectStoppedContainers = createSelector(
  [selectContainers],
  (containers) => containers.filter(container => container.State !== 'running')
)

export const selectRunningContainersCount = createSelector(
  [selectRunningContainers],
  (runningContainers) => runningContainers.length
)

export const selectContainersCount = createSelector(
  [selectContainers],
  (containers) => containers.length
)

export const selectSuccessRate = createSelector(
  [selectTotalRequests, selectFailedRequests],
  (total, failed) => {
    if (total === 0) return 0
    return Math.round(((total - failed) / total) * 100)
  }
)

export const selectNginxContainer = createSelector(
  [selectContainers],
  (containers) => containers.find(container => 
    container.Names.some(name => name.includes('nginx')) ||
    container.Image.toLowerCase().includes('nginx')
  )
)

export const selectPrivacyToolContainers = createSelector(
  [selectContainers],
  (containers) => containers.filter(container => 
    container.Image.toLowerCase().includes('searxng') || 
    container.Image.toLowerCase().includes('pihole')
  )
)

export const selectContainerStatus = createSelector(
  [
    selectIsConnected,
    selectIsPolling,
    selectPollInterval,
    selectNextPollTime,
    selectLastUpdateTime,
    selectLastErrorTime,
    selectTotalRequests,
    selectFailedRequests,
    selectLastError,
  ],
  (
    isConnected,
    isPolling,
    pollInterval,
    nextPollTime,
    lastUpdateTime,
    lastErrorTime,
    totalRequests,
    failedRequests,
    lastError
  ) => ({
    isConnected,
    isPolling,
    pollInterval,
    nextPollTime: nextPollTime ? new Date(nextPollTime) : null,
    lastUpdate: lastUpdateTime ? new Date(lastUpdateTime) : null,
    lastErrorTime: lastErrorTime ? new Date(lastErrorTime) : null,
    totalRequests,
    failedRequests,
    errorMessage: lastError,
  })
)

// Container by ID selector factory
export const selectContainerById = (containerId: string) =>
  createSelector(
    [selectContainers],
    (containers) => containers.find(container => container.Id === containerId)
  )

// Action loading state for specific container
export const selectIsContainerActionLoading = (containerId: string) =>
  createSelector(
    [selectActionLoadingContainerId],
    (loadingContainerId) => loadingContainerId === containerId
  )
