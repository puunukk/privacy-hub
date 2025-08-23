/**
 * App Initializer Saga - Handles complete application startup sequence
 * 
 * This saga manages the entire app initialization process:
 * 1. Theme initialization and application 
 * 2. UI setup and configuration
 * 3. Data loading coordination
 * 4. Error recovery and fallback states
 * 
 * This replaces the scattered initialization logic across multiple sagas
 */

import { put, call, takeEvery } from 'redux-saga/effects'

import { 
  setAppStatus, 
  initializeApp, 
  setTheme,
  showNotification
} from '@/store/appConfig/appConfigSlice'
import { AppConfigActionTypes } from '@/store/appConfig/types'
import { DataManagerActionTypes } from './dataManager'
import { ServiceHeartbeatActionTypes } from './serviceHeartbeat'
import { applyTheme } from './appConfig/applyTheme'

/**
 * Applies the theme based on saved preference or system default
 */
function* initializeThemeSaga(): Generator {
  try {
    console.log('🎨 Initializing theme...')
    
    // Get saved theme from localStorage or default to auto
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null
    const themeToUse = savedTheme || 'auto'
    
    console.log(`🎨 Applying theme: ${themeToUse}`)
    
    // Apply the theme to the DOM
    yield call(applyTheme, themeToUse)
    
    // Update the Redux state
    yield put(setTheme({ theme: themeToUse }))
    
    console.log('✅ Theme initialized successfully')
    
  } catch (error) {
    console.error('❌ Theme initialization failed:', error)
    // Continue with default theme
    yield put(setTheme({ theme: 'auto' }))
  }
}

/**
 * Shows welcome notification on first load
 */
function* showWelcomeNotificationSaga(): Generator {
  const isFirstVisit = !localStorage.getItem('app-initialized')
  
  if (isFirstVisit) {
    yield put(showNotification({
      id: 'welcome',
      type: 'info',
      title: 'Welcome to Privacy Hub! 🍓',
      message: 'Your Raspberry Pi dashboard is ready',
      timestamp: Date.now(),
      duration: 8000
    }))
    
    localStorage.setItem('app-initialized', 'true')
  } else {
    yield put(showNotification({
      id: 'ready',
      type: 'success', 
      title: 'Privacy Hub Ready 🚀',
      message: 'All systems loaded successfully',
      timestamp: Date.now(),
      duration: 4000
    }))
  }
}

/**
 * Main app initialization saga - coordinates the entire startup sequence
 */
function* appInitializationSaga(): Generator {
  console.log('🚀 Starting app initialization...')
  
  try {
    // Set initializing status
    yield put(setAppStatus('INITIALIZING'))
    
    // Step 1: Initialize theme and UI
    yield call(initializeThemeSaga)
    
    // Step 2: Mark app as initialized in Redux
    yield put(initializeApp())
    
    // Step 3: Start service heartbeat FIRST (resilient architecture)
    yield put({ type: ServiceHeartbeatActionTypes.START_HEARTBEAT })
    
    // Step 4: Start data loading process (will adapt to available services)
    yield put({ type: DataManagerActionTypes.START_INITIAL_LOAD })
    
    // Step 5: Show welcome notification
    yield call(showWelcomeNotificationSaga)
    
    // Step 6: Mark app as ready (even if some services are down)
    yield put(setAppStatus('READY'))
    
    console.log('✅ App initialization completed successfully')
    
  } catch (error) {
    console.error('❌ App initialization failed:', error)
    
    // Still mark as initialized so UI can render
    yield put(initializeApp())
    yield put(setAppStatus('ERROR'))
    
    // Show error notification
    yield put(showNotification({
      id: 'init-error',
      type: 'error',
      title: 'Initialization Error',
      message: 'Some features may not work properly. Please refresh the page.',
      timestamp: Date.now(),
      duration: 10000
    }))
  }
}

/**
 * Main app initializer saga watcher
 */
function* appInitializerSaga(): Generator {
  console.log('🎯 App Initializer started')
  
  // Listen for initialization requests
  yield takeEvery(AppConfigActionTypes.INITIALIZE_APP, appInitializationSaga)
}

export default appInitializerSaga