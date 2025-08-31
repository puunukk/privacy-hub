// System Commands - Simple enum for all system operations
export enum SystemCommands {
    SHUTDOWN = 'shutdown',
    REBOOT = 'reboot', 
    FORCE_SHUTDOWN = 'force-shutdown',
    FORCE_REBOOT = 'force-reboot',
    RESTART_SERVICES = 'restart-services'
}

// Action types for data fetching only
export enum SystemActionTypes {
    FETCH_SYSTEM_INFO = 'FETCH_SYSTEM_INFO',
    FETCH_SYSTEM_METRICS = 'FETCH_SYSTEM_METRICS',
    EXECUTE_SYSTEM_COMMAND = 'EXECUTE_SYSTEM_COMMAND'
}

// Command execution status
export enum CommandStatus {
    IDLE = 'idle',
    EXECUTING = 'executing',
    SUCCESS = 'success',
    ERROR = 'error'
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
