import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RealNetworkInfo } from '../../utils/network'

export interface NetworkState {
  networkInfo: RealNetworkInfo | null
  isLoading: boolean
  error: string | null
  lastUpdateTime: number | null
}

const initialState: NetworkState = {
  networkInfo: null,
  isLoading: false,
  error: null,
  lastUpdateTime: null,
}

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    fetchNetworkInfoRequest: (state) => {
      state.isLoading = true
      state.error = null
    },
    
    fetchNetworkInfoSuccess: (state, action: PayloadAction<{
      networkInfo: RealNetworkInfo
      timestamp: number
    }>) => {
      state.networkInfo = action.payload.networkInfo
      state.isLoading = false
      state.error = null
      state.lastUpdateTime = action.payload.timestamp
    },
    
    fetchNetworkInfoFailure: (state, action: PayloadAction<{
      error: string
      timestamp: number
    }>) => {
      state.isLoading = false
      state.error = action.payload.error
      state.lastUpdateTime = action.payload.timestamp
    },

    clearNetworkError: (state) => {
      state.error = null
    },

    resetNetworkState: () => initialState,
  },
})

export const {
  fetchNetworkInfoRequest,
  fetchNetworkInfoSuccess,
  fetchNetworkInfoFailure,
  clearNetworkError,
  resetNetworkState,
} = networkSlice.actions

export default networkSlice.reducer
