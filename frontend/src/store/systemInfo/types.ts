// System Info Action Types
export enum SystemInfoActionTypes {
    FETCH_SYSTEM_INFO_REQUEST = 'FETCH_SYSTEM_INFO_REQUEST',
    FETCH_SYSTEM_INFO_SUCCESS = 'FETCH_SYSTEM_INFO_SUCCESS',
    FETCH_SYSTEM_INFO_FAILURE = 'FETCH_SYSTEM_INFO_FAILURE',
}

// System Info Status Enum
export type SystemInfoStatus =
    | 'UNKNOWN'
    | 'LOADING'
    | 'READY'
    | 'ERROR'

// System Info types - matches backend API response
export interface SystemInfo {
    hostname: string
    ip: string
    gateway: string
    dns: string
    uptime: string
}

// System Info State
export interface SystemInfoState {
    status: SystemInfoStatus
    data: SystemInfo | null
    lastUpdated: number | null
    error: string | null
}
