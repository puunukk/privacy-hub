import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Base selectors
export const selectSystemState = (state: RootState) => state.system
export const selectIsInitialized = (state: RootState) => state.system.isInitialized
export const selectIsLoading = (state: RootState) => state.system.isLoading
export const selectCurrentOperation = (state: RootState) => state.system.currentOperation
export const selectTheme = (state: RootState) => state.system.theme
export const selectNotifications = (state: RootState) => state.system.notifications
export const selectGlobalError = (state: RootState) => state.system.globalError
export const selectErrorSource = (state: RootState) => state.system.errorSource

// Computed selectors
export const selectIsDarkTheme = createSelector(
  [selectTheme],
  (theme) => theme === 'dark'
)

export const selectActiveNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter(notification => {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutes
    return now - notification.timestamp < maxAge
  })
)

export const selectNotificationsByType = createSelector(
  [selectActiveNotifications],
  (notifications) => {
    return {
      success: notifications.filter(n => n.type === 'success'),
      error: notifications.filter(n => n.type === 'error'),
      warning: notifications.filter(n => n.type === 'warning'),
      info: notifications.filter(n => n.type === 'info'),
    }
  }
)

export const selectHasUnreadErrors = createSelector(
  [selectNotificationsByType],
  (notificationsByType) => notificationsByType.error.length > 0
)

export const selectAppStatus = createSelector(
  [selectIsInitialized, selectIsLoading, selectCurrentOperation, selectGlobalError],
  (isInitialized, isLoading, currentOperation, globalError) => ({
    isInitialized,
    isLoading,
    currentOperation,
    hasError: !!globalError,
    errorMessage: globalError,
  })
)
