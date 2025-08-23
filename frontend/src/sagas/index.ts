import { all, fork } from 'redux-saga/effects'

// New streamlined sagas
import appInitializerSaga from './appInitializer'
import dataManagerSaga from './dataManager'
import containerOperationsSaga from './containerOperations'
import serviceHeartbeatSaga from './serviceHeartbeat'

// Keep existing sagas that are still needed
import systemSaga from './system'
import metricsSaga from './system/metricsSaga'
import notificationSaga from './appConfig/notificationSaga'

/**
 * Root Saga - Coordinates all application sagas
 * 
 * New Architecture:
 * - appInitializerSaga: Handles complete app startup
 * - dataManagerSaga: Manages all data fetching and polling
 * - containerOperationsSaga: Handles container actions
 * - systemSaga: System power operations
 * - metricsSaga: Metrics data fetching
 * - notificationSaga: Notification management
 */
export default function* rootSaga() {
    console.log('🏁 Root Saga started with new architecture')
    
    yield all([
        // Core application flow - resilient architecture
        fork(serviceHeartbeatSaga),    // Service discovery first
        fork(appInitializerSaga),      // App initialization
        fork(dataManagerSaga),         // Data management
        
        // Feature-specific sagas
        fork(containerOperationsSaga), // Container operations
        fork(systemSaga),             // System operations
        fork(metricsSaga),            // Metrics
        fork(notificationSaga),       // Notifications
    ])
    
    console.log('✅ All sagas forked successfully')
}
