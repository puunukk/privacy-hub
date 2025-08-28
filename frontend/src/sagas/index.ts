import { all, fork } from 'redux-saga/effects'

// New unified loop manager
import unifiedLoopManagerSaga from './unifiedLoopManager'

// Keep only essential sagas
import containerOperationsSaga from './containerOperations'
import systemSaga from './system'  // Includes both system info and metrics loopers
import dockerSaga from './docker'
import appConfigSagas from './appConfig'  // Includes theme saga and notification saga

// DISABLED: Old polling systems that are now handled by UnifiedLoopManager
// import dataManagerSaga from './dataManager'  // REPLACED by UnifiedLoopManager
// import serviceHeartbeatSaga from './serviceHeartbeat'  // REPLACED - heartbeat now smart in UnifiedLoopManager

/**
 * Root Saga - Coordinates all application sagas
 * 
 * NEW UNIFIED ARCHITECTURE:
 * - unifiedLoopManagerSaga: ALL polling/looping logic in one place
 *   - Configurable intervals per endpoint
 *   - UI-controllable enable/disable
 *   - Smart heartbeat (1s only when services down)
 * - appConfigSagas: Theme, notifications (auto-initializes on first render)
 * - containerOperationsSaga: Container actions (start/stop/restart)
 * - systemSaga: System power operations
 * - metricsSaga: Metrics data fetching (called by loop manager)
 * - notificationSaga: Notification management
 */
export default function* rootSaga() {
    console.log('🏁 Root Saga started with UNIFIED LOOP ARCHITECTURE')
    
    yield all([
        // Core unified loop management
        fork(unifiedLoopManagerSaga),  // ALL polling logic here
        
        // Data fetching sagas with built-in loopers
        fork(dockerSaga),             // Docker data fetching (containers, info, etc)
        fork(systemSaga),             // System info + metrics + power operations
        
        // Feature-specific sagas (actions only)
        fork(containerOperationsSaga), // Container operations
        fork(appConfigSagas),         // App config (theme, notifications, auto-init)
    ])
    
    console.log('✅ All sagas forked - Unified Loop Manager active')
}
