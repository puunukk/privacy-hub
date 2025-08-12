import { ComponentType } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { DockerContainer, DockerInfo } from '../../types/docker'
import type { RealNetworkInfo } from '../../utils/network'
import type { Notification } from '../slices/systemSlice'

// Container Redux Props
export interface ContainerReduxProps {
  containers: DockerContainer[]
  dockerInfo: DockerInfo | null
  isContainersLoading: boolean
  containerError: string | null
  actionLoadingContainerId: string | null
  containerStatus: {
    isConnected: boolean
    isPolling: boolean
    pollInterval: number
    nextPollTime: number | null
    lastUpdate: Date | null
    totalRequests: number
    failedRequests: number
    errorMessage: string | null
  }
  dispatch: Dispatch
}

// System Redux Props
export interface SystemReduxProps {
  isInitialized: boolean
  isLoading: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
  globalError: string | null
  dispatch: Dispatch
}

// Network Redux Props
export interface NetworkReduxProps {
  networkInfo: RealNetworkInfo | null
  isNetworkLoading: boolean
  networkError: string | null
  dispatch: Dispatch
}

// Container HOC - Simplified approach
export function withContainerRedux<P extends ContainerReduxProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, keyof ContainerReduxProps>> {
  
  const mapStateToProps = (state: RootState) => ({
    containers: state?.containers?.containers || [],
    dockerInfo: state?.containers?.dockerInfo || null,
    isContainersLoading: state?.containers?.isLoading || false,
    containerError: state?.containers?.error || null,
    actionLoadingContainerId: state?.containers?.actionLoadingContainerId || null,
    containerStatus: {
      isConnected: state?.containers?.isConnected || false,
      isPolling: state?.containers?.isPolling || false,
      pollInterval: state?.containers?.pollInterval || 10000,
      nextPollTime: state?.containers?.nextPollTime || null,
      lastUpdate: state?.containers?.lastUpdateTime ? new Date(state.containers.lastUpdateTime) : null,
      totalRequests: state?.containers?.totalRequests || 0,
      failedRequests: state?.containers?.failedRequests || 0,
      errorMessage: state?.containers?.error || null,
    },
  })

  const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

  // Use type assertion to bypass complex connect typing
  return connect(mapStateToProps, mapDispatchToProps)(WrappedComponent as any) as any
}

// System HOC
export function withSystemRedux<P extends SystemReduxProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, keyof SystemReduxProps>> {
  
  const mapStateToProps = (state: RootState) => ({
    isInitialized: state?.system?.isInitialized || false,
    isLoading: state?.system?.isLoading || false,
    theme: state?.system?.theme || 'light',
    notifications: state?.system?.notifications || [],
    globalError: state?.system?.globalError || null,
  })

  const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

  return connect(mapStateToProps, mapDispatchToProps)(WrappedComponent as any) as any
}

// Network HOC
export function withNetworkRedux<P extends NetworkReduxProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, keyof NetworkReduxProps>> {
  
  const mapStateToProps = (state: RootState) => ({
    networkInfo: state?.network?.networkInfo || null,
    isNetworkLoading: state?.network?.isLoading || false,
    networkError: state?.network?.error || null,
  })

  const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

  return connect(mapStateToProps, mapDispatchToProps)(WrappedComponent as any) as any
}