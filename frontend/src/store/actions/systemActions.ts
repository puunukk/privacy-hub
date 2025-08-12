import { createAction } from '@reduxjs/toolkit'
import { SystemActionTypes } from './types'

export const initializeApp = createAction(SystemActionTypes.INITIALIZE_APP)

export const setTheme = createAction<{
  theme: 'light' | 'dark'
}>(SystemActionTypes.SET_THEME)

export const showNotification = createAction<{
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}>(SystemActionTypes.SHOW_NOTIFICATION)

export const hideNotification = createAction<{
  id: string
}>(SystemActionTypes.HIDE_NOTIFICATION)

export const setLoading = createAction<{
  isLoading: boolean
  operation?: string
}>(SystemActionTypes.SET_LOADING)

export const setError = createAction<{
  error: string
  source?: string
}>(SystemActionTypes.SET_ERROR)

export const clearError = createAction(SystemActionTypes.CLEAR_ERROR)
