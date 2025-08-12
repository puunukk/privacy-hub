import { call, put, delay, fork, takeEvery, select } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'
import { SystemActionTypes, ContainerActionTypes, NetworkActionTypes } from '../actions/types'
import {
  initializeApp,
  setTheme,
  hideNotification,
} from '../slices/systemSlice'
import type { RootState } from '../store'

function* initializeAppSaga() {
  try {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemDark)
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
      yield put(setTheme({ theme: 'dark' }))
    } else {
      document.documentElement.classList.remove('dark')
      yield put(setTheme({ theme: 'light' }))
    }

    // Start initial data fetching
    yield put({ type: NetworkActionTypes.FETCH_NETWORK_INFO_REQUEST })
    yield put({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST })
    
    // Start container polling after initial load
    yield delay(1000)
    yield put({ type: ContainerActionTypes.START_CONTAINER_POLLING, payload: { interval: 10000 } })

    yield put(initializeApp())
    
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
}

function* setThemeSaga(action: PayloadAction<{ theme: 'light' | 'dark' }>) {
  const { theme } = action.payload
  
  try {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  } catch (error) {
    console.error('Failed to set theme:', error)
  }
}

function* autoHideNotificationSaga(action: PayloadAction<{
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}>) {
  const { id, duration = 5000 } = action.payload
  
  // Auto-hide notification after duration
  if (duration > 0) {
    yield delay(duration)
    yield put(hideNotification({ id }))
  }
}

function* cleanupExpiredNotificationsSaga() {
  while (true) {
    yield delay(30000) // Check every 30 seconds
    
    const state: RootState = yield select()
    const now = Date.now()
    const expiredThreshold = 5 * 60 * 1000 // 5 minutes
    
    // Auto-remove notifications older than 5 minutes
    for (const notification of state.system.notifications) {
      if (now - notification.timestamp > expiredThreshold) {
        yield put(hideNotification({ id: notification.id }))
      }
    }
  }
}

export default function* systemSaga() {
  yield fork(cleanupExpiredNotificationsSaga)
  yield takeEvery(SystemActionTypes.INITIALIZE_APP, initializeAppSaga)
  yield takeEvery(SystemActionTypes.SET_THEME, setThemeSaga)
  yield takeEvery(SystemActionTypes.SHOW_NOTIFICATION, autoHideNotificationSaga)
}
