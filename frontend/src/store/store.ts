import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import containerReducer from './slices/containerSlice'
import networkReducer from './slices/networkSlice'
import systemReducer from './slices/systemSlice'
import rootSaga from './sagas'

// Create saga middleware
const sagaMiddleware = createSagaMiddleware()

// Configure store
export const store = configureStore({
  reducer: {
    containers: containerReducer,
    network: networkReducer,
    system: systemReducer,
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
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Run the root saga
sagaMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
