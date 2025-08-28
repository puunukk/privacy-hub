import { call, delay, put } from 'redux-saga/effects'
import { updateLoopStatus } from '@/store/loops/loopsSlice'

/**
 * Reusable looper that calls a function repeatedly with delay and tracks statistics
 * 
 * @param func - Generator function to call repeatedly
 * @param interval - Delay between calls in milliseconds, null/0 to stop
 * @param loopId - Optional loop ID for tracking statistics in Redux
 * 
 * @example
 * // Use in a saga
 * yield fork(looper, loadSystemMetrics, 5000, 'system_metrics')
 */
export function* looper(
  func: () => Generator<any, void, any>, 
  interval: number | null,
  loopId?: string
): Generator<any, void, any> {
  // Loop while interval is valid
  while (interval !== null && interval > 0) {
    try {
      // Update status to running if tracking
      if (loopId) {
        yield put(updateLoopStatus({ 
          id: loopId, 
          status: 'running',
          lastRun: Date.now()
        }))
      }
      
      // Call the function
      yield call(func)
      
      // Update success count if tracking
      if (loopId) {
        yield put(updateLoopStatus({ 
          id: loopId, 
          successCount: '+1'
        }))
      }
    } catch (error) {
      // Update error count if tracking
      if (loopId) {
        yield put(updateLoopStatus({ 
          id: loopId, 
          errorCount: '+1',
          status: 'error'
        }))
      }
      // Log error but continue looping
      console.error(`Looper error${loopId ? ` in ${loopId}` : ''}:`, error)
    }
    
    // Wait for interval
    yield delay(interval)
  }
  
  // Update status to idle when stopped
  if (loopId) {
    yield put(updateLoopStatus({ 
      id: loopId, 
      status: 'idle'
    }))
  }
}