import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Base selectors
export const selectNetworkState = (state: RootState) => state.network
export const selectNetworkInfo = (state: RootState) => state.network.networkInfo
export const selectIsNetworkLoading = (state: RootState) => state.network.isLoading
export const selectNetworkError = (state: RootState) => state.network.error
export const selectNetworkLastUpdateTime = (state: RootState) => state.network.lastUpdateTime

// Computed selectors
export const selectIsDnsConfigured = createSelector(
  [selectNetworkInfo],
  (networkInfo) => {
    if (!networkInfo) return false
    return networkInfo.dnsServers.includes(networkInfo.hostIP)
  }
)

export const selectNetworkSummary = createSelector(
  [selectNetworkInfo, selectIsDnsConfigured],
  (networkInfo, isDnsConfigured) => {
    if (!networkInfo) return null
    
    return {
      hostname: networkInfo.hostname,
      hostIP: networkInfo.hostIP,
      gateway: networkInfo.gateway,
      subnet: networkInfo.subnet,
      isDhcpClient: networkInfo.isDhcpClient,
      isDnsConfigured,
      macAddress: networkInfo.macAddress,
      dnsServers: networkInfo.dnsServers,
    }
  }
)
