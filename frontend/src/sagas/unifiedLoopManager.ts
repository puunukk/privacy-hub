/**
 * Unified Loop Manager Saga
 * 
 * Centralized, configurable polling system for all endpoints.
 * Features:
 * - Individual loop control (enable/disable)
 * - Configurable intervals per endpoint
 * - Smart heartbeat (1s only when services are down)
 * - UI-controllable from settings
 */

import {
  call,
  put,
  select,
  fork,
  cancel,
  delay,
  all,
  takeLatest
} from 'redux-saga/effects'
import { Task } from 'redux-saga'
import { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { performHealthCheck } from './serviceHealthCheck'

// Loop configuration interface
export interface LoopConfig {
  id: string                                    // Unique identifier
  name: string                                  // Display name
  description: string                           // What this loop does
  action: string                                // Redux action to dispatch
  category: 'system' | 'docker' | 'metrics' | 'health'
  defaultInterval: number                      // Default interval in ms
  minInterval: number                          // Minimum allowed interval
  maxInterval: number                          // Maximum allowed interval
  enabled: boolean                             // Is this loop active?
}

// Loop state tracking
export interface LoopState {
  enabled: boolean
  interval: number
  lastRun: number
  status: 'idle' | 'running' | 'error'
  errorCount: number
  successCount: number
}

// Action types for loop manager
export enum LoopManagerActionTypes {
  INITIALIZE_LOOPS = 'LOOP_MANAGER/INITIALIZE',
  START_LOOP = 'LOOP_MANAGER/START_LOOP',
  STOP_LOOP = 'LOOP_MANAGER/STOP_LOOP',
  TOGGLE_LOOP = 'LOOP_MANAGER/TOGGLE_LOOP',
  UPDATE_LOOP_INTERVAL = 'LOOP_MANAGER/UPDATE_INTERVAL',
  UPDATE_LOOP_STATUS = 'LOOP_MANAGER/UPDATE_STATUS',
  PAUSE_ALL_LOOPS = 'LOOP_MANAGER/PAUSE_ALL',
  RESUME_ALL_LOOPS = 'LOOP_MANAGER/RESUME_ALL',
  SERVICE_STATUS_CHANGED = 'LOOP_MANAGER/SERVICE_STATUS_CHANGED',
}

// Import action types from existing modules
import { ContainerActionTypes } from '@/store/docker/types'
import { SystemInfoActionTypes } from '@/store/systemInfo/types'
import { MetricsActionTypes } from '@/store/metrics/types'
import { updateLoopStatus, toggleLoop, updateLoopInterval } from '@/store/loops/loopsSlice'

// Default loop configurations for all endpoints
export const DEFAULT_LOOP_CONFIGS: LoopConfig[] = [
  // System endpoints
  {
    id: 'system_info',
    name: 'System Info',
    description: 'Raspberry Pi system information (OS, hardware, etc)',
    action: SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST,
    category: 'system',
    defaultInterval: 300000,  // 5 minutes
    minInterval: 60000,       // 1 minute
    maxInterval: 600000,      // 10 minutes
    enabled: true
  },
  {
    id: 'system_metrics',
    name: 'System Metrics',
    description: 'CPU, memory, disk, temperature metrics',
    action: MetricsActionTypes.FETCH_METRICS_REQUEST,
    category: 'metrics',
    defaultInterval: 5000,    // 5 seconds default
    minInterval: 1000,        // 1 second
    maxInterval: 30000,       // 30 seconds
    enabled: true
  },

  // Docker endpoints
  {
    id: 'docker_containers',
    name: 'Docker Containers',
    description: 'Container list and status',
    action: ContainerActionTypes.FETCH_CONTAINERS_REQUEST,
    category: 'docker',
    defaultInterval: 15000,   // 15 seconds
    minInterval: 5000,        // 5 seconds
    maxInterval: 60000,       // 1 minute
    enabled: true
  },
  {
    id: 'docker_stats',
    name: 'Container Stats',
    description: 'Container resource usage statistics (auto-fetched with containers)',
    action: 'DOCKER/FETCH_STATS_REQUEST',  // Custom action for stats
    category: 'docker',
    defaultInterval: 30000,   // 30 seconds
    minInterval: 10000,       // 10 seconds
    maxInterval: 120000,      // 2 minutes
    enabled: false  // Disabled - stats are now fetched automatically with containers
  },
  {
    id: 'docker_info',
    name: 'Docker Info',
    description: 'Docker daemon information',
    action: ContainerActionTypes.FETCH_DOCKER_INFO_REQUEST,
    category: 'docker',
    defaultInterval: 120000,  // 2 minutes
    minInterval: 60000,       // 1 minute
    maxInterval: 300000,      // 5 minutes
    enabled: true
  },
  {
    id: 'docker_networks',
    name: 'Docker Networks',
    description: 'Docker network configuration',
    action: 'DOCKER/FETCH_NETWORKS_REQUEST',  // Custom action for networks
    category: 'docker',
    defaultInterval: 300000,  // 5 minutes (rarely changes)
    minInterval: 60000,       // 1 minute
    maxInterval: 600000,      // 10 minutes
    enabled: false  // Disabled by default - rarely needed
  },

  // Health check - special handling
  {
    id: 'health_check',
    name: 'Service Health',
    description: 'Check if services are responding',
    action: 'SERVICE_HEALTH/CHECK_REQUEST',  // Custom action for health checks
    category: 'health',
    defaultInterval: 30000,   // 30 seconds normally
    minInterval: 1000,        // 1 second (when services down)
    maxInterval: 60000,       // 1 minute
    enabled: true
  }
]

// Track active loop tasks
const loopTasks: Map<string, Task> = new Map()

// Track service health for smart heartbeat
let serviceHealth = {
  allServicesUp: true,
  lastCheck: 0,
  docker: true,
  backend: true,
  pihole: true
}

/**
 * Individual loop runner
 */
function* runLoop(config: LoopConfig, currentInterval: number): Generator {
  const loopId = config.id
  console.log(`🔄 Starting loop: ${config.name} (${currentInterval}ms interval)`)

  try {
    while (true) {
      // Update status to running
      yield put(updateLoopStatus({
        id: loopId,
        status: 'running',
        lastRun: Date.now()
      }))

      // Special handling for health check - call the saga directly
      if (config.id === 'health_check') {
        yield call(performHealthCheck)

        // Get current interval based on service health
        const interval = serviceHealth.allServicesUp
          ? config.defaultInterval  // 30 seconds when all up
          : config.minInterval       // 1 second when any service down

        if (interval !== currentInterval) {
          console.log(`💓 Health check interval changed: ${currentInterval}ms → ${interval}ms`)
          currentInterval = interval
        }

        yield delay(currentInterval)
      } else {
        // Normal loops dispatch their action
        yield put({ type: config.action })
        yield delay(currentInterval)
      }

      // Update success count
      yield put(updateLoopStatus({
        id: loopId,
        successCount: '+1'
      }))
    }
  } catch (error) {
    console.error(`❌ Loop error in ${config.name}:`, error)

    // Update error status
    yield put(updateLoopStatus({
      id: loopId,
      status: 'error',
      errorCount: '+1'
    }))
  } finally {
    console.log(`⏹️ Loop stopped: ${config.name}`)

    // Update status to idle
    yield put(updateLoopStatus({
      id: loopId,
      status: 'idle'
    }))
  }
}

/**
 * Start a specific loop
 */
function* startLoop(config: LoopConfig): Generator {
  const loopId = config.id

  // Cancel existing task if running
  const existingTask = loopTasks.get(loopId)
  if (existingTask) {
    yield cancel(existingTask)
    loopTasks.delete(loopId)
  }

  // Get current interval from state or use default
  const state: RootState = yield select()
  const loopState = state.loops?.[loopId]
  const interval = loopState?.interval || config.defaultInterval

  // Start new loop task
  const task: Task = yield fork(runLoop, config, interval)
  loopTasks.set(loopId, task)

  console.log(`✅ Loop started: ${config.name}`)
}

/**
 * Stop a specific loop
 */
function* stopLoop(loopId: string): Generator {
  const task = loopTasks.get(loopId)
  if (task) {
    yield cancel(task)
    loopTasks.delete(loopId)
    console.log(`Loop stopped: ${loopId}`)
  }
}

/**
 * Handle loop toggle action
 */
function* handleToggleLoop(action: PayloadAction<{ id: string }>): Generator {
  const { id } = action.payload
  const config = DEFAULT_LOOP_CONFIGS.find(c => c.id === id)

  if (!config) {
    console.error(`Loop config not found: ${id}`)
    return
  }

  const state: RootState = yield select()
  const isEnabled = state.loops?.[id]?.enabled

  // Update Redux state
  yield put(toggleLoop({ id }))

  // Start/stop the actual loop
  if (isEnabled) {
    yield call(stopLoop, id)
  } else {
    yield call(startLoop, config)
  }
}

/**
 * Handle interval update
 */
function* handleUpdateInterval(action: PayloadAction<{ id: string, interval: number }>): Generator {
  const { id, interval } = action.payload
  const config = DEFAULT_LOOP_CONFIGS.find(c => c.id === id)

  if (!config) {
    console.error(`Loop config not found: ${id}`)
    return
  }

  // Validate interval
  const validInterval = Math.max(
    config.minInterval,
    Math.min(interval, config.maxInterval)
  )

  // Update Redux state
  yield put(updateLoopInterval({ id, interval: validInterval }))

  // Restart loop with new interval
  yield call(stopLoop, id)
  yield call(startLoop, { ...config, defaultInterval: validInterval })

  console.log(`⏱️ Loop interval updated: ${config.name} = ${validInterval}ms`)
}

/**
 * Handle service status changes for smart heartbeat
 */
function* handleServiceStatusChange(action: PayloadAction<any>): Generator {
  const { docker, backend, pihole } = action.payload || {}

  const wasAllUp = serviceHealth.allServicesUp
  serviceHealth = {
    docker: docker ?? serviceHealth.docker,
    backend: backend ?? serviceHealth.backend,
    pihole: pihole ?? serviceHealth.pihole,
    allServicesUp: docker && backend && pihole,
    lastCheck: Date.now()
  }

  // If service status changed, log it
  if (wasAllUp !== serviceHealth.allServicesUp) {
    if (serviceHealth.allServicesUp) {
      console.log('✅ All services restored - switching to normal heartbeat interval')
    } else {
      console.log('⚠️ Service down detected - switching to rapid heartbeat (1s)')
    }

    // Health check loop will automatically adjust its interval
  }
}

/**
 * Initialize all loops based on configuration
 */
function* initializeLoops(): Generator {
  console.log('🚀 Initializing Unified Loop Manager')

  // Start enabled loops
  for (const config of DEFAULT_LOOP_CONFIGS) {
    if (config.enabled) {
      yield call(startLoop, config)
    }
  }

  console.log(`✅ Initialized ${DEFAULT_LOOP_CONFIGS.filter(c => c.enabled).length} loops`)
}

/**
 * Pause all active loops
 */
function* pauseAllLoops(): Generator {
  console.log('⏸️ Pausing all loops')

  for (const [loopId, task] of loopTasks.entries()) {
    yield cancel(task)
    loopTasks.delete(loopId)
  }

  console.log('✅ All loops paused')
}

/**
 * Resume all previously enabled loops
 */
function* resumeAllLoops(): Generator {
  console.log('▶️ Resuming all loops')

  const state: RootState = yield select()

  for (const config of DEFAULT_LOOP_CONFIGS) {
    const loopState = state.loops?.[config.id]
    if (loopState?.enabled || config.enabled) {
      yield call(startLoop, config)
    }
  }

  console.log('✅ Loops resumed')
}

/**
 * Main loop manager saga
 */
function* unifiedLoopManagerSaga(): Generator {
  console.log('🎯 Unified Loop Manager Saga started')

  // Set up action watchers
  yield all([
    takeLatest(LoopManagerActionTypes.INITIALIZE_LOOPS, initializeLoops),
    takeLatest(LoopManagerActionTypes.TOGGLE_LOOP, handleToggleLoop),
    takeLatest(LoopManagerActionTypes.UPDATE_LOOP_INTERVAL, handleUpdateInterval),
    takeLatest(LoopManagerActionTypes.PAUSE_ALL_LOOPS, pauseAllLoops),
    takeLatest(LoopManagerActionTypes.RESUME_ALL_LOOPS, resumeAllLoops),
    takeLatest(LoopManagerActionTypes.SERVICE_STATUS_CHANGED, handleServiceStatusChange),
  ])

  // NOTE: Do not auto-initialize here - wait for explicit INITIALIZE_LOOPS action from App
  console.log('✅ Loop manager watchers ready - waiting for INITIALIZE_LOOPS action')
}

export default unifiedLoopManagerSaga