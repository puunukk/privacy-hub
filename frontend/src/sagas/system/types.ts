// System Action Types - only for system/device information
export enum SystemActionTypes {
    FETCH_SYSTEM_INFO_REQUEST = 'FETCH_SYSTEM_INFO_REQUEST',
    FETCH_SYSTEM_INFO_SUCCESS = 'FETCH_SYSTEM_INFO_SUCCESS',
    FETCH_SYSTEM_INFO_FAILURE = 'FETCH_SYSTEM_INFO_FAILURE',

    FETCH_SYSTEM_METRICS_REQUEST = 'FETCH_SYSTEM_METRICS_REQUEST',
    FETCH_SYSTEM_METRICS_SUCCESS = 'FETCH_SYSTEM_METRICS_SUCCESS',
    FETCH_SYSTEM_METRICS_FAILURE = 'FETCH_SYSTEM_METRICS_FAILURE',

    // System Power Operations
    SYSTEM_SHUTDOWN_REQUEST = 'SYSTEM_SHUTDOWN_REQUEST',
    SYSTEM_SHUTDOWN_SUCCESS = 'SYSTEM_SHUTDOWN_SUCCESS',
    SYSTEM_SHUTDOWN_FAILURE = 'SYSTEM_SHUTDOWN_FAILURE',
    SYSTEM_REBOOT_REQUEST = 'SYSTEM_REBOOT_REQUEST',
    SYSTEM_REBOOT_SUCCESS = 'SYSTEM_REBOOT_SUCCESS',
    SYSTEM_REBOOT_FAILURE = 'SYSTEM_REBOOT_FAILURE',
    SYSTEM_FORCE_SHUTDOWN_REQUEST = 'SYSTEM_FORCE_SHUTDOWN_REQUEST',
    SYSTEM_FORCE_SHUTDOWN_SUCCESS = 'SYSTEM_FORCE_SHUTDOWN_SUCCESS',
    SYSTEM_FORCE_SHUTDOWN_FAILURE = 'SYSTEM_FORCE_SHUTDOWN_FAILURE',
}

// System Status Enum - simplified state management
export enum SystemStatus {
    UNKNOWN = 'unknown',
    LOADING = 'loading',
    READY = 'ready',
    ERROR = 'error',
    SHUTTING_DOWN = 'shutting_down',
    REBOOTING = 'rebooting',
}

// System Info types
export interface SystemInfo {
    hostname: string
    platform: string
    arch: string
    version: string
    uptime: number
    memory: {
        total: number
        free: number
        used: number
    }
    cpu: {
        cores: number
        model: string
        usage: number
    }
    network: {
        interfaces: Array<{
            name: string
            address: string
            netmask: string
        }>
    }
}

export interface SystemMetrics {
    cpu: {
        usage: number
        temperature: number
    }
    memory: {
        total: number
        free: number
        used: number
        percentage: number
    }
    disk: {
        total: number
        free: number
        used: number
        percentage: number
    }
    network: {
        bytesReceived: number
        bytesSent: number
    }
}
