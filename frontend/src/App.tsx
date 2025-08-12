import { Component } from 'react'
import { Provider } from 'react-redux'
import { Header } from './components/Header'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorAlert } from './components/ErrorAlert'
import { SystemInfo } from './components/SystemInfo'
import { ContainersTable } from './components/ContainersTable'
import { NotificationManager } from './components/NotificationManager'
import { store } from './store/store'
import { connect } from 'react-redux'
import type { RootState } from './store/store'
import { SystemActionTypes } from './store/actions/types'
import type { Dispatch } from '@reduxjs/toolkit'

interface AppContentProps {
  isInitialized: boolean
  isLoading: boolean
  globalError: string | null
  networkInfo: RootState['network']['networkInfo']
  networkError: string | null
  dockerInfo: RootState['containers']['dockerInfo']
  containerError: string | null
  dispatch: Dispatch
}

interface AppContentState {}

class AppContentBase extends Component<AppContentProps, AppContentState> {
  constructor(props: AppContentProps) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.props.dispatch({ type: SystemActionTypes.INITIALIZE_APP })
  }

  render() {
    const { 
      isInitialized, 
      isLoading, 
      globalError,
      networkInfo, 
      networkError,
      dockerInfo, 
      containerError 
    } = this.props

    if (!isInitialized || isLoading) {
      return <LoadingSpinner />
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {networkError && <ErrorAlert error={networkError} />}
          {containerError && <ErrorAlert error={containerError} />}
          {globalError && <ErrorAlert error={globalError} />}

          <SystemInfo dockerInfo={dockerInfo} networkInfo={networkInfo} />
          
          <ContainersTable />
        </main>

        <NotificationManager />
      </div>
    )
  }
}

// Connect AppContent to Redux
const AppContent = connect(
  (state: RootState) => ({
    isInitialized: state.system.isInitialized,
    isLoading: state.system.isLoading,
    globalError: state.system.globalError,
    networkInfo: state.network.networkInfo,
    networkError: state.network.error,
    dockerInfo: state.containers.dockerInfo,
    containerError: state.containers.error,
  }),
  (dispatch: Dispatch) => ({ dispatch })
)(AppContentBase)

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <AppContent />
      </Provider>
    )
  }
}

export default App