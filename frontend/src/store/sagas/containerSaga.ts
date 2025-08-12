import { call, put, take, fork, cancel, delay, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { Task } from 'redux-saga'
import { PayloadAction } from '@reduxjs/toolkit'
import { ContainerActionTypes } from '../actions/types'
import {
  fetchContainersSuccess,
  fetchContainersFailure,
  fetchDockerInfoSuccess,
  executeContainerActionSuccess,
  executeContainerActionFailure,
  setConnectionStatus,
  updatePollingStatus,
  containerPollTick,
} from '../slices/containerSlice'
import { showNotification } from '../slices/systemSlice'
import type { DockerContainer, DockerInfo, ContainerAction } from '../../types/docker'
import type { RootState } from '../store'

// API Functions
async function fetchContainersAPI(): Promise<DockerContainer[]> {
  const response = await fetch('/api/docker/containers/json?all=true')
  if (!response.ok) {
    throw new Error(`Failed to fetch containers: ${response.status}`)
  }
  return response.json()
}

async function fetchDockerInfoAPI(): Promise<DockerInfo> {
  const response = await fetch('/api/docker/info')
  if (!response.ok) {
    throw new Error(`Failed to fetch Docker info: ${response.status}`)
  }
  return response.json()
}

async function executeContainerActionAPI(containerId: string, action: ContainerAction): Promise<void> {
  if (action === 'privacy_reset') {
    // Handle privacy reset specially
    const containerInfo = await fetch(`/api/docker/containers/${containerId}/json`)
    if (!containerInfo.ok) {
      throw new Error('Failed to get container info for privacy reset')
    }
    
    const container = await containerInfo.json()
    
    // Stop if running
    if (container.State.Running) {
      await executeContainerActionAPI(containerId, 'stop')
    }
    
    // Remove container
    await executeContainerActionAPI(containerId, 'remove')
    
    throw new Error('Privacy reset completed. Please restart the container from your docker-compose file.')
  }

  const response = await fetch(`/api/docker/containers/${containerId}/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to ${action} container: ${errorText}`)
  }
}

// Saga Workers
function* fetchContainersSaga() {
  try {
    const [containers, dockerInfo]: [DockerContainer[], DockerInfo] = yield Promise.all([
      call(fetchContainersAPI),
      call(fetchDockerInfoAPI),
    ])

    const timestamp = Date.now()
    
    yield put(fetchContainersSuccess({ containers, timestamp }))
    yield put(fetchDockerInfoSuccess({ dockerInfo, timestamp }))
    yield put(setConnectionStatus({ isConnected: true }))
    
  } catch (error) {
    const timestamp = Date.now()
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    yield put(fetchContainersFailure({ error: errorMessage, timestamp }))
    yield put(setConnectionStatus({ isConnected: false, error: errorMessage }))
  }
}

function* executeContainerActionSaga(action: PayloadAction<{
  containerId: string
  action: ContainerAction
  containerName?: string
}>) {
  const { containerId, action: containerAction, containerName } = action.payload
  
  try {
    yield call(executeContainerActionAPI, containerId, containerAction)
    
    const timestamp = Date.now()
    yield put(executeContainerActionSuccess({ 
      containerId, 
      action: containerAction, 
      timestamp 
    }))

    // Show success notification
    yield put(showNotification({
      id: `action-success-${containerId}-${timestamp}`,
      type: 'success',
      title: 'Container Action Successful',
      message: `Successfully executed "${containerAction}" on ${containerName || 'container'}`,
      duration: 3000,
    }))

    // Refresh containers after successful action
    yield put({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST })
    
  } catch (error) {
    const timestamp = Date.now()
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    yield put(executeContainerActionFailure({ 
      containerId, 
      action: containerAction, 
      error: errorMessage, 
      timestamp 
    }))

    // Show error notification
    yield put(showNotification({
      id: `action-error-${containerId}-${timestamp}`,
      type: 'error',
      title: 'Container Action Failed',
      message: errorMessage,
      duration: 5000,
    }))
  }
}

function* restartNginxSaga() {
  try {
    // Get current containers to find nginx
    const state: RootState = yield select()
    const nginxContainer = state.containers.containers.find(container => 
      container.Names.some(name => name.includes('nginx')) ||
      container.Image.toLowerCase().includes('nginx')
    )

    if (!nginxContainer) {
      throw new Error('Nginx container not found')
    }

    yield put({
      type: ContainerActionTypes.EXECUTE_CONTAINER_ACTION_REQUEST,
      payload: {
        containerId: nginxContainer.Id,
        action: 'restart',
        containerName: 'nginx',
      }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to restart nginx'
    yield put(showNotification({
      id: `nginx-error-${Date.now()}`,
      type: 'error',
      title: 'Nginx Restart Failed',
      message: errorMessage,
      duration: 5000,
    }))
  }
}

function* refreshContainersSaga() {
  // Clear containers to show loading state
  yield put(fetchContainersSuccess({ containers: [], timestamp: Date.now() }))
  
  // Fetch fresh data
  yield put({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST })
}

// Polling Saga
function* containerPollingTask(pollInterval: number) {
  try {
    while (true) {
      const nextPollTime = Date.now() + pollInterval
      yield put(updatePollingStatus({ 
        isPolling: true, 
        nextPollTime,
        interval: pollInterval 
      }))

      yield delay(pollInterval)
      yield put(containerPollTick())
      yield put({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST })
    }
  } finally {
    yield put(updatePollingStatus({ isPolling: false, nextPollTime: undefined }))
  }
}

function* startPollingWatcher() {
  let pollingTask: Task | null = null

  while (true) {
    const action: PayloadAction<{ interval?: number }> = yield take(ContainerActionTypes.START_CONTAINER_POLLING)
    
    // Cancel existing polling task if any
    if (pollingTask) {
      yield cancel(pollingTask)
    }

    // Start new polling task
    const interval = action.payload?.interval || 10000
    pollingTask = yield fork(containerPollingTask, interval)

    // Wait for stop action
    yield take(ContainerActionTypes.STOP_CONTAINER_POLLING)
    
    if (pollingTask) {
      yield cancel(pollingTask)
      pollingTask = null
    }
  }
}

// Root Container Saga
export default function* containerSaga() {
  yield fork(startPollingWatcher)
  yield takeLatest(ContainerActionTypes.FETCH_CONTAINERS_REQUEST, fetchContainersSaga)
  yield takeEvery(ContainerActionTypes.EXECUTE_CONTAINER_ACTION_REQUEST, executeContainerActionSaga)
  yield takeEvery(ContainerActionTypes.RESTART_NGINX, restartNginxSaga)
  yield takeEvery(ContainerActionTypes.REFRESH_CONTAINERS, refreshContainersSaga)
}
