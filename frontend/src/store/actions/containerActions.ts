import { createAction } from '@reduxjs/toolkit'
import { ContainerActionTypes } from './types'
import type { DockerContainer, DockerInfo, ContainerAction } from '../../types/docker'

// Container Data Actions
export const fetchContainersRequest = createAction(ContainerActionTypes.FETCH_CONTAINERS_REQUEST)

export const fetchContainersSuccess = createAction<{
  containers: DockerContainer[]
  timestamp: number
}>(ContainerActionTypes.FETCH_CONTAINERS_SUCCESS)

export const fetchContainersFailure = createAction<{
  error: string
  timestamp: number
}>(ContainerActionTypes.FETCH_CONTAINERS_FAILURE)

// Docker Info Actions
export const fetchDockerInfoRequest = createAction(ContainerActionTypes.FETCH_DOCKER_INFO_REQUEST)

export const fetchDockerInfoSuccess = createAction<{
  dockerInfo: DockerInfo
  timestamp: number
}>(ContainerActionTypes.FETCH_DOCKER_INFO_SUCCESS)

export const fetchDockerInfoFailure = createAction<{
  error: string
  timestamp: number
}>(ContainerActionTypes.FETCH_DOCKER_INFO_FAILURE)

// Container Operations
export const executeContainerActionRequest = createAction<{
  containerId: string
  action: ContainerAction
  containerName?: string
}>(ContainerActionTypes.EXECUTE_CONTAINER_ACTION_REQUEST)

export const executeContainerActionSuccess = createAction<{
  containerId: string
  action: ContainerAction
  timestamp: number
}>(ContainerActionTypes.EXECUTE_CONTAINER_ACTION_SUCCESS)

export const executeContainerActionFailure = createAction<{
  containerId: string
  action: ContainerAction
  error: string
  timestamp: number
}>(ContainerActionTypes.EXECUTE_CONTAINER_ACTION_FAILURE)

// Polling Actions
export const startContainerPolling = createAction<{
  interval?: number
}>(ContainerActionTypes.START_CONTAINER_POLLING)

export const stopContainerPolling = createAction(ContainerActionTypes.STOP_CONTAINER_POLLING)

export const containerPollTick = createAction(ContainerActionTypes.CONTAINER_POLL_TICK)

// Manual Operations
export const refreshContainers = createAction(ContainerActionTypes.REFRESH_CONTAINERS)

export const restartNginx = createAction(ContainerActionTypes.RESTART_NGINX)

// Connection Status
export const setConnectionStatus = createAction<{
  isConnected: boolean
  error?: string
}>(ContainerActionTypes.SET_CONNECTION_STATUS)

export const updatePollingStatus = createAction<{
  isPolling: boolean
  nextPollTime?: number
  interval?: number
}>(ContainerActionTypes.UPDATE_POLLING_STATUS)
