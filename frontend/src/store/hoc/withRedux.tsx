import { Component, ComponentType } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Dispatch } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Generic HOC for connecting components to Redux
export interface WithReduxProps {
  dispatch: Dispatch
}

// Create a connector that provides dispatch and full state access
const connector = connect(
  (state: RootState) => ({ reduxState: state }),
  (dispatch: Dispatch) => ({ dispatch })
)

export type ReduxConnectedProps = ConnectedProps<typeof connector>

// HOC that provides Redux connection
export function withRedux<P extends object>(
  WrappedComponent: ComponentType<P & ReduxConnectedProps>
): ComponentType<Omit<P, keyof ReduxConnectedProps>> {
  
  class WithReduxComponent extends Component<Omit<P, keyof ReduxConnectedProps> & ReduxConnectedProps> {
    render() {
      return <WrappedComponent {...(this.props as P & ReduxConnectedProps)} />
    }
  }

  return connector(WithReduxComponent) as ComponentType<Omit<P, keyof ReduxConnectedProps>>
}

// Specialized HOC for container-related components
export interface WithContainerReduxProps extends WithReduxProps {
  containers: RootState['containers']['containers']
  dockerInfo: RootState['containers']['dockerInfo']
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
}

const containerConnector = connect(
  (state: RootState) => ({
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
    reduxState: state
  }),
  (dispatch: Dispatch) => ({ dispatch })
)

export type ContainerConnectedProps = ConnectedProps<typeof containerConnector>

export function withContainerRedux<P extends object>(
  WrappedComponent: ComponentType<P & ContainerConnectedProps>
): ComponentType<Omit<P, keyof ContainerConnectedProps>> {
  
  class WithContainerReduxComponent extends Component<Omit<P, keyof ContainerConnectedProps> & ContainerConnectedProps> {
    render() {
      return <WrappedComponent {...(this.props as P & ContainerConnectedProps)} />
    }
  }

  return containerConnector(WithContainerReduxComponent) as ComponentType<Omit<P, keyof ContainerConnectedProps>>
}

// System-related HOC
export interface WithSystemReduxProps extends WithReduxProps {
  isInitialized: boolean
  isLoading: boolean
  theme: 'light' | 'dark'
  notifications: RootState['system']['notifications']
  globalError: string | null
}

const systemConnector = connect(
  (state: RootState) => ({
    isInitialized: state.system.isInitialized,
    isLoading: state.system.isLoading,
    theme: state.system.theme,
    notifications: state.system.notifications,
    globalError: state.system.globalError,
    reduxState: state
  }),
  (dispatch: Dispatch) => ({ dispatch })
)

export type SystemConnectedProps = ConnectedProps<typeof systemConnector>

export function withSystemRedux<P extends object>(
  WrappedComponent: ComponentType<P & SystemConnectedProps>
): ComponentType<Omit<P, keyof SystemConnectedProps>> {
  
  class WithSystemReduxComponent extends Component<Omit<P, keyof SystemConnectedProps> & SystemConnectedProps> {
    render() {
      return <WrappedComponent {...(this.props as P & SystemConnectedProps)} />
    }
  }

  return systemConnector(WithSystemReduxComponent) as ComponentType<Omit<P, keyof SystemConnectedProps>>
}

// Network-related HOC
export interface WithNetworkReduxProps extends WithReduxProps {
  networkInfo: RootState['network']['networkInfo']
  isNetworkLoading: boolean
  networkError: string | null
}

const networkConnector = connect(
  (state: RootState) => ({
    networkInfo: state.network.networkInfo,
    isNetworkLoading: state.network.isLoading,
    networkError: state.network.error,
    reduxState: state
  }),
  (dispatch: Dispatch) => ({ dispatch })
)

export type NetworkConnectedProps = ConnectedProps<typeof networkConnector>

export function withNetworkRedux<P extends object>(
  WrappedComponent: ComponentType<P & NetworkConnectedProps>
): ComponentType<Omit<P, keyof NetworkConnectedProps>> {
  
  class WithNetworkReduxComponent extends Component<Omit<P, keyof NetworkConnectedProps> & NetworkConnectedProps> {
    render() {
      return <WrappedComponent {...(this.props as P & NetworkConnectedProps)} />
    }
  }

  return networkConnector(WithNetworkReduxComponent) as ComponentType<Omit<P, keyof NetworkConnectedProps>>
}
