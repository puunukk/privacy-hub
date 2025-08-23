import { Component } from 'react'
import { connect } from 'react-redux'

import { ErrorAlert, NotificationManager } from '@/components/shared'
import PiDashboard from '@/components/dashboard/PiDashboard'
import { ContainersTable } from '@/components/ContainersTableNew'
import type { RootState } from '@/store'
import { Typography } from '@/components/ui/Typography'
import { AppConfigActionTypes } from '@/store/appConfig/types'
import { getDisplayVersion } from '@/utils/version'
import { DataManagerComponent } from '@/api/DataManagerConnector'
import DevTest from '@/DevTest'

/**
 * App component - the main component for the application.
 *
 * Now uses the unified data manager instead of complex saga patterns.
 * Much simpler initialization and error handling.
 */

interface AppProps {
  globalError?: string
  dispatch: (action: any) => void
}

class App extends DataManagerComponent<AppProps> {
  // Cache version info to avoid recalculating on every render
  displayVersion = getDisplayVersion()

  componentDidMount() {
    super.componentDidMount()
    // Simple app initialization - just theme and basic setup
    // Data manager handles all the API calls automatically
    this.props.dispatch({ type: AppConfigActionTypes.INITIALIZE_APP })
  }

  render() {
    const { globalError } = this.props
    const { data } = this.state

    // Show dev test component in development mode
    if (process.env.NODE_ENV === 'development' && window.location.search.includes('test')) {
      return <DevTest />
    }

    return (
      <>
        {/* Error alerts - now from unified data manager */}
        {/*{data.errors.systemMetrics && <ErrorAlert error={data.errors.systemMetrics} />}
        {data.errors.containers && <ErrorAlert error={data.errors.containers} />}
        {data.errors.dockerInfo && <ErrorAlert error={data.errors.dockerInfo} />}*/}
        {/*globalError && <ErrorAlert error={globalError} />*/}

        {/* Modern Pi Dashboard */}
        <PiDashboard />

        {/* Containers Section */}
        <div id="containers-section" className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ContainersTable />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <Typography.Text size="sm" color="muted">
              🍓 Private Hub ver. {this.displayVersion} &copy; {new Date().getFullYear()} •
              Powered by Raspberry Pi
            </Typography.Text>
          </div>
        </footer>

        <NotificationManager />
      </>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  globalError: state.appConfig.error
})

export default connect(mapStateToProps)(App) 
