import { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import type { Dispatch } from '@reduxjs/toolkit'

import { ErrorAlert } from './components/ErrorAlert'
import { QuickAccess } from './components/QuickAccess'
import SystemInfoCard from './components/SystemInfoCard'
import NetworkSetupCard from './components/NetworkSetupCard'
import { ContainersTable } from './components/ContainersTable'
import type { RootState } from './store'
import { cn } from './utils/cn'
import { Typography } from './components/ui/Typography'
import Header from './connectedComponents/Header'
import NotificationManager from './components/NotificationManager'
import { SystemInfoActionTypes } from './store/systemInfo/types'
import { MetricsActionTypes } from './store/metrics/types'
import { AppConfigActionTypes } from './store/appConfig/types'
import { getDisplayVersion } from './utils/version'

const mapStateToProps = (state: RootState) => ({
  globalError: state.appConfig.error,
  networkError: state.systemInfo.error,
  containerError: state.containers.error,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch })

const connector = connect(mapStateToProps, mapDispatchToProps)
type AppProps = ConnectedProps<typeof connector>


/**
 * App component - the main component for the application.
 *
 * This is the main component for the application.
 * It is responsible for rendering the header, main content, and footer.
 * It also handles the initialization of the application and the fetching of the temperature.
 */
class App extends Component<AppProps> {
  // Cache version info to avoid recalculating on every render
  private displayVersion = getDisplayVersion()

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({ type: AppConfigActionTypes.INITIALIZE_APP })
    //  // Ensure temperature fetch runs even if init saga timing changes
    //  dispatch({ type: TemperatureActionTypes.FETCH_TEMPERATURE_REQUEST })
    dispatch({ type: SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST })
    dispatch({ type: MetricsActionTypes.FETCH_METRICS_REQUEST })
  }

  render() {
    const {
      globalError,
      networkError,
      containerError
    } = this.props

    const pageContainerCls = cn(
      'min-h-screen', // full height
      'bg-gray-50 dark:bg-gray-900 transition-colors' // background color
    )

    const mainCls = cn(
      'max-w-7xl mx-auto', // page container
      'px-4 sm:px-6 lg:px-8 py-8', // page padding
    )

    return (
      <div className={pageContainerCls}>
        <Header />

        <main className={mainCls}>

          {networkError && <ErrorAlert error={networkError} />}
          {containerError && <ErrorAlert error={containerError} />}
          {globalError && <ErrorAlert error={globalError} />}

          <QuickAccess />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SystemInfoCard />
            </div>
            <div className="lg:col-span-1">
              <NetworkSetupCard />
            </div>
          </div>

          <ContainersTable />
        </main>

        <footer className="transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <Typography.Text size="sm" color="muted">
              Private Hub ver. {this.displayVersion} &copy; {new Date().getFullYear()}
            </Typography.Text>
          </div>
        </footer>

        <NotificationManager />
      </div>
    )
  }
}

export default connector(App) 
