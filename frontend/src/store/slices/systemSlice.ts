import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  timestamp: number
}

export interface SystemState {
  // App State
  isInitialized: boolean
  isLoading: boolean
  currentOperation: string | null
  
  // Theme
  theme: 'light' | 'dark'
  
  // Notifications
  notifications: Notification[]
  
  // Global Error
  globalError: string | null
  errorSource: string | null
}

const initialState: SystemState = {
  isInitialized: false,
  isLoading: false,
  currentOperation: null,
  theme: 'light',
  notifications: [],
  globalError: null,
  errorSource: null,
}

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    initializeApp: (state) => {
      state.isInitialized = true
    },

    setTheme: (state, action: PayloadAction<{ theme: 'light' | 'dark' }>) => {
      state.theme = action.payload.theme
    },

    setLoading: (state, action: PayloadAction<{
      isLoading: boolean
      operation?: string
    }>) => {
      state.isLoading = action.payload.isLoading
      state.currentOperation = action.payload.operation || null
    },

    showNotification: (state, action: PayloadAction<{
      id: string
      type: 'success' | 'error' | 'warning' | 'info'
      title: string
      message: string
      duration?: number
    }>) => {
      const notification: Notification = {
        ...action.payload,
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },

    hideNotification: (state, action: PayloadAction<{ id: string }>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload.id
      )
    },

    setError: (state, action: PayloadAction<{
      error: string
      source?: string
    }>) => {
      state.globalError = action.payload.error
      state.errorSource = action.payload.source || null
    },

    clearError: (state) => {
      state.globalError = null
      state.errorSource = null
    },

    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = []
    },

    resetSystemState: () => initialState,
  },
})

export const {
  initializeApp,
  setTheme,
  setLoading,
  showNotification,
  hideNotification,
  setError,
  clearError,
  clearAllNotifications,
  resetSystemState,
} = systemSlice.actions

export default systemSlice.reducer
