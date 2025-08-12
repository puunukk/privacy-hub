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
    containers: state.containers.containers,
    dockerInfo: state.containers.dockerInfo,
    isContainersLoading: state.containers.isLoading,
    containerError: state.containers.error,
    actionLoadingContainerId: state.containers.actionLoadingContainerId,
    containerStatus: {
      isConnected: state.containers.isConnected,
      isPolling: state.containers.isPolling,
      pollInterval: state.containers.pollInterval,
      nextPollTime: state.containers.nextPollTime,
      lastUpdate: state.containers.lastUpdateTime ? new Date(state.containers.lastUpdateTime) : null,
      totalRequests: state.containers.totalRequests,
      failedRequests: state.containers.failedRequests,
      errorMessage: state.containers.error,
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
    isInitialized: state.system.isInitialized,
    isLoading: state.system.isLoading,
    theme: state.system.theme,
    notifications: state.system.notifications,
    globalError: state.system.globalError,
  })

  const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

  return connect(mapStateToProps, mapDispatchToProps)(WrappedComponent as any) as any
}

// Network HOC
export function withNetworkRedux<P extends NetworkReduxProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, keyof NetworkReduxProps>> {
  
  const mapStateToProps = (state: RootState) => ({
    networkInfo: state.network.networkInfo,
    isNetworkLoading: state.network.isLoading,
    networkError: state.network.error,
  })

  const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

  return connect(mapStateToProps, mapDispatchToProps)(WrappedComponent as any) as any
}