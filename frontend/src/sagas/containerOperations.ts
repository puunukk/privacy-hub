/**
 * Container Operations Saga - Handles all Docker container interactions
 * 
 * This saga manages:
 * - Container actions (start, stop, restart, etc.)
 * - Nginx operations (restart)
 * - Manual refresh operations
 * - Error handling and user feedback
 */

import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'

import { executeContainerAction } from '@/api/executeContainerAction'
import { fetchContainers } from '@/api/fetchContainers'
import { executeSystemCmd } from '@/api/executeSystemCmd'
import { showNotification } from '@/store/appConfig/appConfigSlice'
import { 
  executeContainerActionRequest,
  executeContainerActionSuccess, 
  executeContainerActionFailure,
  fetchContainersSuccess,
  fetchContainersFailure
} from '@/store/docker/containerSlice'

import { ContainerActionTypes } from '@/store/docker/types'
import type { ExecuteContainerActionPayload } from '@/sagas/docker/types'

/**
 * Executes a container action (start, stop, restart, etc.)
 */
function* executeContainerActionSaga(
  action: PayloadAction<ExecuteContainerActionPayload>
): Generator {
  const { containerId, action: containerAction, containerName } = action.payload
  const actionLabel = `${containerAction} ${containerName || containerId}`
  
  console.log(`🐳 Executing container action: ${actionLabel}`)
  
  try {
    yield put(executeContainerActionRequest({ 
      containerId, 
      action: containerAction 
    }))
    
    // Show immediate feedback
    yield put(showNotification({
      id: `container-${containerId}-${Date.now()}`,
      type: 'info',
      title: 'Container Action',
      message: `${containerAction} ${containerName || 'container'}...`,
      timestamp: Date.now(),
      duration: 3000
    }))
    
    // Execute the action
    yield call(executeContainerAction, containerId, containerAction)
    
    yield put(executeContainerActionSuccess({ 
      containerId, 
      action: containerAction, 
      timestamp: Date.now()
    }))
    
    // Show success notification
    yield put(showNotification({
      id: `container-success-${containerId}-${Date.now()}`,
      type: 'success',
      title: 'Success',
      message: `Successfully ${containerAction}ed ${containerName || 'container'}`,
      timestamp: Date.now(),
      duration: 5000
    }))
    
    // Refresh container data after action
    yield put({ type: ContainerActionTypes.REFRESH_CONTAINERS })
    
  } catch (error: any) {
    console.error(`❌ Container action failed: ${actionLabel}`, error)
    
    yield put(executeContainerActionFailure({ 
      containerId, 
      action: containerAction, 
      error: error.message || 'Unknown error',
      timestamp: Date.now()
    }))
    
    // Show error notification
    yield put(showNotification({
      id: `container-error-${containerId}-${Date.now()}`,
      type: 'error',
      title: 'Container Action Failed',
      message: `Failed to ${containerAction} ${containerName || 'container'}: ${error.message}`,
      timestamp: Date.now(),
      duration: 8000
    }))
  }
}

/**
 * Restarts the NGINX container specifically
 */
function* restartNginxSaga(): Generator {
  console.log('🔄 Restarting NGINX container...')
  
  try {
    yield put(showNotification({
      id: `nginx-restart-${Date.now()}`,
      type: 'info',
      title: 'NGINX Restart',
      message: 'Restarting NGINX proxy...',
      timestamp: Date.now(),
      duration: 3000
    }))
    
    // Execute nginx restart command
    yield call(executeSystemCmd, 'restart-nginx')
    
    yield put(showNotification({
      id: `nginx-success-${Date.now()}`,
      type: 'success',
      title: 'NGINX Restarted',
      message: 'NGINX proxy has been restarted successfully',
      timestamp: Date.now(),
      duration: 5000
    }))
    
    // Refresh containers to show updated status
    yield put({ type: ContainerActionTypes.REFRESH_CONTAINERS })
    
  } catch (error: any) {
    console.error('❌ NGINX restart failed:', error)
    
    yield put(showNotification({
      id: `nginx-error-${Date.now()}`,
      type: 'error',
      title: 'NGINX Restart Failed', 
      message: `Failed to restart NGINX: ${error.message}`,
      timestamp: Date.now(),
      duration: 8000
    }))
  }
}

/**
 * Manually refreshes container data
 */
function* refreshContainersSaga(): Generator {
  console.log('🔄 Manually refreshing containers...')
  
  try {
    const containers = yield call(fetchContainers)
    
    yield put(fetchContainersSuccess({ containers, timestamp: Date.now() }))
    
    yield put(showNotification({
      id: `refresh-success-${Date.now()}`,
      type: 'success',
      title: 'Refreshed',
      message: 'Container data updated',
      timestamp: Date.now(),
      duration: 3000
    }))
    
  } catch (error: any) {
    console.error('❌ Container refresh failed:', error)
    
    yield put(fetchContainersFailure({ error: error.message || 'Refresh failed', timestamp: Date.now() }))
    
    yield put(showNotification({
      id: `refresh-error-${Date.now()}`,
      type: 'error',
      title: 'Refresh Failed',
      message: `Failed to refresh containers: ${error.message}`,
      timestamp: Date.now(),
      duration: 5000
    }))
  }
}

/**
 * Main container operations saga
 */
function* containerOperationsSaga(): Generator {
  console.log('🐳 Container Operations started')
  
  // Handle container actions
  yield takeEvery(
    ContainerActionTypes.EXECUTE_CONTAINER_ACTION_REQUEST, 
    executeContainerActionSaga
  )
  
  // Handle NGINX restart  
  yield takeEvery(
    ContainerActionTypes.RESTART_NGINX, 
    restartNginxSaga
  )
  
  // Handle manual refresh
  yield takeLatest(
    ContainerActionTypes.REFRESH_CONTAINERS, 
    refreshContainersSaga
  )
}

export default containerOperationsSaga