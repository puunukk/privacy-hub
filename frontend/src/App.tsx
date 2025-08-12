import { Component } from 'react'
import { Provider } from 'react-redux'
import { Header } from './components/Header'
import { ErrorAlert } from './components/ErrorAlert'
import { SystemInfo } from './components/SystemInfo'
import { ContainersTable } from './components/ContainersTable'
import { NotificationManager } from './components/NotificationManager'
import { DebugInfo } from './components/DebugInfo'
import { store } from './store/store'
import { connect } from 'react-redux'
import type { RootState } from './store/store'
import { SystemActionTypes } from './store/actions/types'
import type { Dispatch } from '@reduxjs/toolkit'

interface AppContentProps {
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
      globalError,
      networkInfo, 
      networkError,
      dockerInfo, 
      containerError 
    } = this.props

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
        <DebugInfo />
      </div>
    )
  }
}

// Connect AppContent to Redux
const AppContent = connect(
  (state: RootState) => ({
    globalError: state?.system?.globalError || null,
    networkInfo: state?.network?.networkInfo || null,
    networkError: state?.network?.error || null,
    dockerInfo: state?.containers?.dockerInfo || null,
    containerError: state?.containers?.error || null,
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