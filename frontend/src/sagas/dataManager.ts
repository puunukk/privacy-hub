/**
 * Data Manager Saga - Centralized data loading and polling logic
 * 
 * This saga manages the application's data fetching lifecycle:
 * 1. Initial data load on app startup
 * 2. Configurable polling for different data types
 * 3. Graceful error handling and retry logic
 * 4. Clear separation of concerns
 */

import { 
  call, 
  put, 
  select, 
  fork, 
  take, 
  cancel, 
  delay
} from 'redux-saga/effects'
import { Task } from 'redux-saga'
import type { RootState } from '@/store'
import { AppConfigActionTypes } from '@/store/appConfig/types'
import { SystemInfoActionTypes } from '@/store/systemInfo/types'
import { MetricsActionTypes } from '@/store/metrics/types'
import { ContainerActionTypes } from '@/store/docker/types'

// Action types for data manager
export enum DataManagerActionTypes {
  START_INITIAL_LOAD = 'DATA_MANAGER/START_INITIAL_LOAD',
  INITIAL_LOAD_COMPLETE = 'DATA_MANAGER/INITIAL_LOAD_COMPLETE',
  START_POLLING = 'DATA_MANAGER/START_POLLING',
  STOP_POLLING = 'DATA_MANAGER/STOP_POLLING',
  POLLING_TICK = 'DATA_MANAGER/POLLING_TICK',
}

/**
 * Performs the initial data load when the app starts
 * Loads all critical data before starting polling
 */
function* performInitialLoadSaga(): Generator {
  console.log('🚀 Starting resilient initial data load...')
  
  try {
    // Attempt to load data, but don't fail if services are down
    console.log('📡 Attempting initial data fetch (services may be starting)...')
    
    // Fire off requests - these will gracefully fail if services are down
    yield put({ type: SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST })
    yield put({ type: MetricsActionTypes.FETCH_METRICS_REQUEST })
    yield put({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST })
    yield put({ type: ContainerActionTypes.FETCH_DOCKER_INFO_REQUEST })
    
    // Don't wait too long - services might be starting
    yield delay(1000)
    
    console.log('✅ Initial data load attempted (services will connect via heartbeat)')
    yield put({ type: DataManagerActionTypes.INITIAL_LOAD_COMPLETE })
    
    // Start polling - heartbeat will manage service availability
    yield put({ type: DataManagerActionTypes.START_POLLING })
    
  } catch (error) {
    console.log('⚠️ Initial data load had issues (expected during startup):', error)
    // Always continue - heartbeat will handle reconnection
    yield put({ type: DataManagerActionTypes.START_POLLING })
  }
}

/**
 * Creates a polling task for a specific data type
 */
function* createPollingTask(
  actionType: string, 
  interval: number, 
  taskName: string
): Generator {
  console.log(`🔄 Starting resilient ${taskName} polling (${interval}ms interval)`)
  
  try {
    while (true) {
      yield delay(interval)
      // Only log occasionally to avoid spam when services are down
      if (Math.random() < 0.1) { // 10% chance to log
        console.log(`📡 ${taskName} polling tick (services checked by heartbeat)`)
      }
      
      // Fire the request - individual sagas will handle failures gracefully
      yield put({ type: actionType })
    }
  } finally {
    console.log(`⏹️ ${taskName} polling stopped`)
  }
}

/**
 * Manages all polling tasks with configurable intervals
 */
function* pollingManagerSaga(): Generator {
  let pollingTasks: { [key: string]: Task } = {}
  
  while (true) {
    const action = yield take([
      DataManagerActionTypes.START_POLLING,
      DataManagerActionTypes.STOP_POLLING,
      AppConfigActionTypes.SET_POLLING_INTERVALS
    ])
    
    if (action.type === DataManagerActionTypes.STOP_POLLING) {
      // Cancel all polling tasks
      console.log('🛑 Stopping all polling tasks')
      for (const taskName in pollingTasks) {
        yield cancel(pollingTasks[taskName])
        delete pollingTasks[taskName]
      }
      continue
    }
    
    if (action.type === DataManagerActionTypes.START_POLLING || 
        action.type === AppConfigActionTypes.SET_POLLING_INTERVALS) {
      
      // Get current polling intervals from state
      const state: RootState = yield select()
      const intervals = state.appConfig.pollingIntervals
      
      // Cancel existing tasks if we're updating intervals
      if (action.type === AppConfigActionTypes.SET_POLLING_INTERVALS) {
        console.log('🔄 Updating polling intervals')
        for (const taskName in pollingTasks) {
          yield cancel(pollingTasks[taskName])
          delete pollingTasks[taskName]
        }
      }
      
      // Start new polling tasks with current intervals
      pollingTasks.containers = yield fork(
        createPollingTask, 
        ContainerActionTypes.FETCH_CONTAINERS_REQUEST,
        intervals.containers,
        'Container'
      )
      
      pollingTasks.metrics = yield fork(
        createPollingTask, 
        MetricsActionTypes.FETCH_METRICS_REQUEST,
        intervals.metrics,
        'Metrics'
      )
      
      pollingTasks.systemInfo = yield fork(
        createPollingTask, 
        SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST,
        intervals.systemInfo,
        'System Info'
      )
      
      console.log('✅ All polling tasks started with intervals:', intervals)
    }
  }
}

/**
 * Main data manager saga - coordinates initial load and polling
 */
function* dataManagerSaga(): Generator {
  console.log('🎯 Data Manager started')
  
  // Fork the polling manager to run concurrently
  yield fork(pollingManagerSaga)
  
  // Wait for initial load request
  while (true) {
    yield take(DataManagerActionTypes.START_INITIAL_LOAD)
    yield call(performInitialLoadSaga)
  }
}

export default dataManagerSaga