import type { DockerContainer, DockerInfo, ContainerAction } from '../../types/docker'

// State Types
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
  isAutoRefreshing: boolean
  autoRefreshInterval: number

  // Polling Status
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

// Action Types
export enum ContainerActionTypes {
  // Main Docker Data Loading
  LOAD_DOCKER_DATA_REQUEST = 'LOAD_DOCKER_DATA_REQUEST',

  // Container Data Management
  FETCH_CONTAINERS_REQUEST = 'FETCH_CONTAINERS_REQUEST',
  FETCH_CONTAINERS_SUCCESS = 'FETCH_CONTAINERS_SUCCESS',
  FETCH_CONTAINERS_FAILURE = 'FETCH_CONTAINERS_FAILURE',

  // Docker Info Management
  FETCH_DOCKER_INFO_REQUEST = 'FETCH_DOCKER_INFO_REQUEST',
  FETCH_DOCKER_INFO_SUCCESS = 'FETCH_DOCKER_INFO_SUCCESS',
  FETCH_DOCKER_INFO_FAILURE = 'FETCH_DOCKER_INFO_FAILURE',

  // Container Operations
  EXECUTE_CONTAINER_ACTION_REQUEST = 'EXECUTE_CONTAINER_ACTION_REQUEST',
  EXECUTE_CONTAINER_ACTION_SUCCESS = 'EXECUTE_CONTAINER_ACTION_SUCCESS',
  EXECUTE_CONTAINER_ACTION_FAILURE = 'EXECUTE_CONTAINER_ACTION_FAILURE',

  // Auto-refresh Control
  START_AUTO_REFRESH = 'START_AUTO_REFRESH',
  STOP_AUTO_REFRESH = 'STOP_AUTO_REFRESH',
  AUTO_REFRESH_TICK = 'AUTO_REFRESH_TICK',

  // Manual Operations
  REFRESH_CONTAINERS = 'REFRESH_CONTAINERS',
  RESTART_NGINX = 'RESTART_NGINX',

  // Connection Status
  SET_CONNECTION_STATUS = 'SET_CONNECTION_STATUS',
  SET_LOADING_STATUS = 'SET_LOADING_STATUS',
}

// Action Payload Types
export interface FetchContainersSuccessPayload {
  containers: DockerContainer[]
  timestamp: number
}

export interface FetchContainersFailurePayload {
  error: string
  timestamp: number
}

export interface FetchDockerInfoSuccessPayload {
  dockerInfo: DockerInfo
  timestamp: number
}

export interface FetchDockerInfoFailurePayload {
  error: string
  timestamp: number
}

export interface ExecuteContainerActionRequestPayload {
  containerId: string
  action: ContainerAction
}

export interface ExecuteContainerActionSuccessPayload {
  containerId: string
  action: ContainerAction
  timestamp: number
}

export interface ExecuteContainerActionFailurePayload {
  containerId: string
  action: ContainerAction
  error: string
  timestamp: number
}

export interface SetConnectionStatusPayload {
  isConnected: boolean
}

export interface UpdatePollingStatusPayload {
  isPolling: boolean
  pollInterval?: number
}
