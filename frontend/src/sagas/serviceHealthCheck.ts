/**
 * Service Health Check Saga
 * 
 * Monitors service availability and triggers smart heartbeat behavior.
 * Works with UnifiedLoopManager to adjust intervals based on service status.
 */

import { call, put } from 'redux-saga/effects'
import { showNotification } from '@/store/appConfig/appConfigSlice'
import { LoopManagerActionTypes } from './unifiedLoopManager'

interface ServiceHealthStatus {
  docker: boolean
  backend: boolean
  pihole: boolean
  allUp: boolean
  timestamp: number
}

// Track previous health status for comparison
let previousHealth: ServiceHealthStatus | null = null

/**
 * Quick health check for a service endpoint
 */
async function checkServiceHealth(endpoint: string, timeout = 2000): Promise<boolean> {
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
 * Check Pi-hole specific health
 */
async function checkPiholeHealth(): Promise<boolean> {
  try {
    const response = await fetch('/pi-hole/api.php?status', {
      method: 'GET',
      cache: 'no-cache',
      signal: AbortSignal.timeout(2000)
    })

    if (!response.ok) return false

    const data = await response.json()
    return data.status === 'enabled'
  } catch {
    return false
  }
}

/**
 * Main health check saga - called by UnifiedLoopManager
 */
export function* performHealthCheck(): Generator {
  try {
    // Check all services in parallel
    const [docker, backend, pihole]: [boolean, boolean, boolean] = yield call(async () => {
      const results = await Promise.all([
        checkServiceHealth('/docker-api/version'),
        checkServiceHealth('/pi-system/health'),
        checkPiholeHealth()
      ])
      return results as [boolean, boolean, boolean]
    })

    const currentHealth: ServiceHealthStatus = {
      docker,
      backend,
      pihole,
      allUp: docker && backend && pihole,
      timestamp: Date.now()
    }

    // Notify UnifiedLoopManager about service status
    yield put({
      type: LoopManagerActionTypes.SERVICE_STATUS_CHANGED,
      payload: currentHealth
    })

    // Handle status changes and notifications
    if (previousHealth) {
      yield call(handleHealthChanges, previousHealth, currentHealth)
    }

    previousHealth = currentHealth

  } catch (error) {
    console.error('Health check failed:', error)

    // Assume all services down on error
    yield put({
      type: LoopManagerActionTypes.SERVICE_STATUS_CHANGED,
      payload: {
        docker: false,
        backend: false,
        pihole: false,
        allUp: false,
        timestamp: Date.now()
      }
    })
  }
}

/**
 * Handle health status changes and show notifications
 */
function* handleHealthChanges(
  previous: ServiceHealthStatus,
  current: ServiceHealthStatus
): Generator {
  const restoredServices: string[] = []
  const failedServices: string[] = []

  // Check what changed
  if (!previous.docker && current.docker) {
    restoredServices.push('Docker')
  } else if (previous.docker && !current.docker) {
    failedServices.push('Docker')
  }

  if (!previous.backend && current.backend) {
    restoredServices.push('Backend API')
  } else if (previous.backend && !current.backend) {
    failedServices.push('Backend API')
  }

  if (!previous.pihole && current.pihole) {
    restoredServices.push('Pi-hole')
  } else if (previous.pihole && !current.pihole) {
    failedServices.push('Pi-hole')
  }

  // Show restoration notifications
  if (restoredServices.length > 0) {
    console.log('✅ Services restored:', restoredServices.join(', '))

    yield put(showNotification({
      id: `services-restored-${Date.now()}`,
      type: 'success',
      title: 'Services Restored',
      message: `${restoredServices.join(', ')} ${restoredServices.length === 1 ? 'is' : 'are'} back online`,
      timestamp: Date.now(),
      duration: 5000
    }))

    // If all services are now up after being down
    if (current.allUp && !previous.allUp) {
      console.log('🎉 All services are now operational - switching to normal polling intervals')

      yield put(showNotification({
        id: `all-services-up-${Date.now()}`,
        type: 'success',
        title: 'All Systems Operational',
        message: 'All services are functioning normally',
        timestamp: Date.now(),
        duration: 7000
      }))
    }
  }

  // Show failure notifications (less aggressive)
  if (failedServices.length > 0) {
    console.log('⚠️ Services failed:', failedServices.join(', '))

    // Only show notification if this is the first failure
    if (previous.allUp && !current.allUp) {
      yield put(showNotification({
        id: `services-failed-${Date.now()}`,
        type: 'warning',
        title: 'Service Connection Lost',
        message: `${failedServices.join(', ')} ${failedServices.length === 1 ? 'is' : 'are'} not responding. Switching to rapid reconnection mode.`,
        timestamp: Date.now(),
        duration: 5000
      }))

      console.log('🔄 Switching to rapid heartbeat mode (1s interval) for quick reconnection')
    }
  }
}

// Export the health check action handler
export default function* serviceHealthCheckSaga(): Generator {
  // This saga is called by UnifiedLoopManager when health_check loop runs
  yield call(performHealthCheck)
}