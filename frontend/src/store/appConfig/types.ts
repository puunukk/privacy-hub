// App Config Action Types
export enum AppConfigActionTypes {
    INITIALIZE_APP = 'INITIALIZE_APP',
    SET_THEME = 'SET_THEME',
    SHOW_NOTIFICATION = 'SHOW_NOTIFICATION',
    HIDE_NOTIFICATION = 'HIDE_NOTIFICATION',
    SET_APP_STATUS = 'SET_APP_STATUS',
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

// App Config State
export interface AppConfigState {
    status: ApplicationStatus
    isInitialized: boolean
    theme: Theme
    notifications: Notification[]
    error: string | null
}
