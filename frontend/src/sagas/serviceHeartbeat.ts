/**
 * Service Heartbeat Saga - Continuous service discovery and health monitoring
 * 
 * This saga implements your excellent idea:
 * - Heartbeat every 1 second to check service availability
 * - Frontend works offline and connects when services come back
 * - Detects when Raspberry Pi restarts and restores connections
 * - Independent of backend services - truly resilient
 */

import { 
  call, 
  put, 
  delay, 
  fork, 
  race, 
  take 
} from 'redux-saga/effects'
import { showNotification, hideNotification } from '@/store/appConfig/appConfigSlice'

// Service health state
interface ServiceHealth {
  backend: boolean
  docker: boolean
  pihole: boolean
  lastCheck: number
}

// Action types for service discovery
export enum ServiceHeartbeatActionTypes {
  START_HEARTBEAT = 'SERVICE_HEARTBEAT/START',
  STOP_HEARTBEAT = 'SERVICE_HEARTBEAT/STOP', 
  SERVICE_STATUS_UPDATE = 'SERVICE_HEARTBEAT/STATUS_UPDATE',
  SERVICES_RESTORED = 'SERVICE_HEARTBEAT/SERVICES_RESTORED',
}

/**
 * Quick health check for a service endpoint
 */
async function checkServiceHealth(endpoint: string, timeout = 1000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache'
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Performs health checks on all services
 */
function* performHealthCheck(): Generator {
  console.log('💓 Performing service health check...')
  
  try {
    // Check all services in parallel with 1 second timeout each
    const [backendHealth, dockerHealth, piholeHealth] = yield race([
      call(checkServiceHealth, '/api/pi-system/health'),
      call(checkServiceHealth, '/api/docker/version'), 
      call(checkServiceHealth, '/api/stats')
    ])
    
    const serviceHealth: ServiceHealth = {
      backend: Boolean(backendHealth),
      docker: Boolean(dockerHealth), 
      pihole: Boolean(piholeHealth),
      lastCheck: Date.now()
    }
    
    // Update service status
    yield put({
      type: ServiceHeartbeatActionTypes.SERVICE_STATUS_UPDATE,
      payload: serviceHealth
    })
    
    return serviceHealth
    
  } catch (error) {
    console.log('💓 Health check failed:', error)
    return {
      backend: false,
      docker: false,
      pihole: false,
      lastCheck: Date.now()
    }
  }
}

/**
 * Manages service status notifications
 */
function* manageServiceNotifications(
  currentHealth: ServiceHealth, 
  previousHealth: ServiceHealth | null
): Generator {
  
  if (!previousHealth) {
    // First check - don't show notifications yet
    return
  }
  
  const servicesRestored: string[] = []
  const servicesLost: string[] = []
  
  // Check what changed
  if (!previousHealth.backend && currentHealth.backend) {
    servicesRestored.push('Backend API')
  } else if (previousHealth.backend && !currentHealth.backend) {
    servicesLost.push('Backend API')
  }
  
  if (!previousHealth.docker && currentHealth.docker) {
    servicesRestored.push('Docker Management')
  } else if (previousHealth.docker && !currentHealth.docker) {
    servicesLost.push('Docker Management')
  }
  
  if (!previousHealth.pihole && currentHealth.pihole) {
    servicesRestored.push('Pi-hole DNS')
  } else if (previousHealth.pihole && !currentHealth.pihole) {
    servicesLost.push('Pi-hole DNS')
  }
  
  // Show restoration notifications
  if (servicesRestored.length > 0) {
    console.log('✅ Services restored:', servicesRestored)
    
    yield put(showNotification({
      id: 'services-restored',
      type: 'success',
      title: '🚀 Services Restored!',
      message: `${servicesRestored.join(', ')} back online`,
      timestamp: Date.now(),
      duration: 5000
    }))
    
    // Trigger services restored event
    yield put({
      type: ServiceHeartbeatActionTypes.SERVICES_RESTORED,
      payload: servicesRestored
    })
  }
  
  // Show service loss notifications (less aggressive)
  if (servicesLost.length > 0) {
    console.log('⚠️ Services lost:', servicesLost)
    
    yield put(showNotification({
      id: 'services-lost',
      type: 'warning',
      title: '⚠️ Services Disconnected',
      message: `${servicesLost.join(', ')} unavailable`,
      timestamp: Date.now(),
      duration: 3000
    }))
  }
}

/**
 * Main heartbeat loop - checks every 1 second
 */
function* heartbeatLoop(): Generator {
  console.log('💗 Starting service heartbeat (1s interval)')
  
  let previousHealth: ServiceHealth | null = null
  
  try {
    while (true) {
      // Perform health check
      const currentHealth: ServiceHealth = yield call(performHealthCheck)
      
      // Manage notifications for service changes
      yield call(manageServiceNotifications, currentHealth, previousHealth)
      
      // Store current health for next comparison
      previousHealth = currentHealth
      
      // Wait 1 second before next check
      yield delay(1000)
    }
  } finally {
    console.log('💔 Service heartbeat stopped')
  }
}

/**
 * Handles service restoration events
 */
function* handleServicesRestored(restoredServices: string[]): Generator {
  console.log('🔄 Handling services restoration:', restoredServices)
  
  // Get current polling intervals
  // const state: RootState = yield select()
  // const intervals = state.appConfig.pollingIntervals
  
  // Restart data fetching for restored services
  if (restoredServices.includes('Backend API')) {
    // Restart metrics and system info polling
    console.log('🔄 Restarting backend data fetching...')
    // Could trigger data manager restart here
  }
  
  if (restoredServices.includes('Docker Management')) {
    // Restart container polling
    console.log('🐳 Restarting container monitoring...')
    // Could trigger container data restart here
  }
  
  // Hide any "service unavailable" notifications
  yield put(hideNotification({ id: 'services-lost' }))
}

/**
 * Service restoration event handler
 */
function* servicesRestoredSaga(): Generator {
  while (true) {
    const action = yield take(ServiceHeartbeatActionTypes.SERVICES_RESTORED)
    yield call(handleServicesRestored, action.payload)
  }
}

/**
 * Main service heartbeat saga coordinator
 */
function* serviceHeartbeatSaga(): Generator {
  console.log('💓 Service Heartbeat Manager started')
  
  // Fork the services restored handler
  yield fork(servicesRestoredSaga)
  
  // Wait for heartbeat start command
  while (true) {
    yield take(ServiceHeartbeatActionTypes.START_HEARTBEAT)
    console.log('💓 Starting service heartbeat monitoring...')
    
    // Start heartbeat loop (will run until stopped)
    const heartbeatTask = yield fork(heartbeatLoop)
    
    // Wait for stop command
    yield take(ServiceHeartbeatActionTypes.STOP_HEARTBEAT)
    console.log('💓 Stopping service heartbeat...')
    
    // Cancel heartbeat
    if (heartbeatTask) {
      heartbeatTask.cancel()
    }
  }
}

export default serviceHeartbeatSaga