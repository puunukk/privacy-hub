import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'

import containerReducer from './docker/containerSlice'
import appConfigReducer from './appConfig/appConfigSlice'
import metricsReducer from './metrics/metricsSlice'
import systemInfoReducer from './systemInfo/systemInfoSlice'

import rootSaga from '@/sagas'

// Create saga middleware
const sagaMiddleware = createSagaMiddleware()

// Configure store
export const store = configureStore({
  reducer: {
    appConfig: appConfigReducer,
    containers: containerReducer,
    metrics: metricsReducer,
    systemInfo: systemInfoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // Disable thunk since we're using sagas
      serializableCheck: {
        ignoredActions: [
          // Ignore saga actions that might contain non-serializable data
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
        ignoredActionsPaths: [
          // Ignore saga-specific action metadata
          '@@redux-saga/SAGA_ACTION',
          'payload.fn',
          'meta.fn',
        ],
        ignoredPaths: [
          // Ignore saga-specific state paths that might contain functions
          'containers.containers.payload.fn',
        ],
      },
    }).concat(sagaMiddleware),
  devTools: (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production'),
})

// Run the root saga
sagaMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
