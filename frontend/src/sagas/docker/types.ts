import type { DockerContainer, ContainerAction } from '@/types/docker'

// Action Types
export enum ContainerActionTypes {
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

    // Container Polling
    START_CONTAINER_POLLING = 'START_CONTAINER_POLLING',
    STOP_CONTAINER_POLLING = 'STOP_CONTAINER_POLLING',
    CONTAINER_POLL_TICK = 'CONTAINER_POLL_TICK',

    // Manual Operations
    REFRESH_CONTAINERS = 'REFRESH_CONTAINERS',
    RESTART_NGINX = 'RESTART_NGINX',

    // Connection Status
    SET_CONNECTION_STATUS = 'SET_CONNECTION_STATUS',
    UPDATE_POLLING_STATUS = 'UPDATE_POLLING_STATUS',
}

// Saga-specific types
export interface ContainerWithStats extends DockerContainer {
    cpuUsage?: string
    memUsage?: string
}

export interface ExecuteContainerActionPayload {
    containerId: string
    action: ContainerAction
    containerName?: string
}

export interface PollingConfig {
    interval?: number
}
