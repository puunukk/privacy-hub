// API Response types
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface ApiStateResponse<T = any> {
    success: boolean
    state?: T
    error?: string
    message?: string
} 