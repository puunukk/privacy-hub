// App Config Action Types
export enum AppConfigActionTypes {
    INITIALIZE_APP = 'INITIALIZE_APP',
    SET_THEME = 'SET_THEME',
    SHOW_NOTIFICATION = 'SHOW_NOTIFICATION',
    HIDE_NOTIFICATION = 'HIDE_NOTIFICATION',
    SET_APP_STATUS = 'SET_APP_STATUS',
    SET_POLLING_INTERVALS = 'SET_POLLING_INTERVALS',
}

// App Status Enum - simplified state management
export type ApplicationStatus =
    | 'UNINITIALIZED'
    | 'INITIALIZING'
    | 'READY'
    | 'ERROR'
    | 'LOADING'

// Theme types
export type Theme = 'light' | 'dark' | 'auto'

// Notification types
export interface Notification {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: number
    duration?: number
}

// Polling intervals configuration
export interface PollingIntervals {
    containers: number      // Container data polling (default: 15s)
    metrics: number        // System metrics polling (default: 30s) 
    systemInfo: number     // System info polling (default: 60s)
}

// App Config State
export interface AppConfigState {
    status: ApplicationStatus
    isInitialized: boolean
    theme: Theme
    notifications: Notification[]
    error: string | null
    pollingIntervals: PollingIntervals
}
