import { createAction } from '@reduxjs/toolkit'
import { NetworkActionTypes } from './types'
import type { RealNetworkInfo } from '../../utils/network'

export const fetchNetworkInfoRequest = createAction(NetworkActionTypes.FETCH_NETWORK_INFO_REQUEST)

export const fetchNetworkInfoSuccess = createAction<{
  networkInfo: RealNetworkInfo
  timestamp: number
}>(NetworkActionTypes.FETCH_NETWORK_INFO_SUCCESS)

export const fetchNetworkInfoFailure = createAction<{
  error: string
  timestamp: number
}>(NetworkActionTypes.FETCH_NETWORK_INFO_FAILURE)
