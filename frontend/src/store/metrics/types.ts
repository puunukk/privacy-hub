// Metrics Action Types
export enum MetricsActionTypes {
    FETCH_METRICS_REQUEST = 'FETCH_METRICS_REQUEST',
    FETCH_METRICS_SUCCESS = 'FETCH_METRICS_SUCCESS',
    FETCH_METRICS_FAILURE = 'FETCH_METRICS_FAILURE',
}

// Metrics Status Enum
export type MetricsStatus =
    | 'UNKNOWN'
    | 'LOADING'
    | 'READY'
    | 'ERROR'

// Metrics types - matches backend API response
export interface SystemMetrics {
    cpu_temp: number
    memory_free: number
    memory_total: number
    memory_used: number
    load_avg: string
    storage: {
        root_partition: {
            total: number
            free: number
            used: number
        }
        partitions: Record<string, {
            total: number
            free: number
            used: number
        }>
        total_disks: number
        storage_devices: Array<{
            name: string
            size: number
            type: string
            mountpoint: string
        }>
    }
    timestamp: number
}

// Metrics State
export interface MetricsState {
    status: MetricsStatus
    data: SystemMetrics | null
    lastUpdated: number | null
    error: string | null
}

