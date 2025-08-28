import { Component } from 'react'
import { connect } from 'react-redux'

import { ErrorAlert, NotificationManager } from '@/components/shared'
import { ConnectedSystemOverview } from '@/connectedComponents/SystemOverview'
import { QuickAccessSection } from '@/components/sections/QuickAccessSection'
import { ConnectedDockerContainersSection } from '@/components/sections/DockerContainersSection'
import { DataManagerSection } from '@/components/sections/DataManagerSection'
import { ConnectedLoopManagerSection } from '@/components/sections/LoopManagerSection'
import { getDisplayVersion } from '@/utils/version'
import { cn } from '@/utils/cn'
import type { RootState } from '@/store'

import DevTest from '@/DevTest'
import Footer from '@/components/Footer'
import Header from '@/connectedComponents/ApplicationHeader'

interface AppProps {
  globalError?: string | null
  hasErrors: boolean
}

class App extends Component<AppProps> {
  displayVersion = getDisplayVersion()

  render() {
    const { globalError, hasErrors } = this.props

    const applicationMainStyles = cn(
      'min-h-screen',
      // 'bg-gray-50 dark:bg-gray-900', // Default solid background
      'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800', // Default gradient background
      'transition-colors duration-300', // transition-colors duration-300
      hasErrors && 'flex items-center justify-center bg-red-50 dark:bg-red-900'
    )

    return (
      <>
        <div className={applicationMainStyles}>
          {/* Application Header */}
          <Header />

          { // Show dev test component in development mode
            (process.env.NODE_ENV === 'development' && window.location.search.includes('test'))
            && <DevTest />
          }

          { // Show connection error for critical failures
            (hasErrors && globalError) && (
              <div className="text-center animate-fade-in">
                <ErrorAlert error={globalError} />
              </div>
            )
          }

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* System Overview - Combined metrics and info */}
            <ConnectedSystemOverview />

            {/* Quick Access Tools - Main focus */}
            <QuickAccessSection />

            {/* Docker Containers Management */}
            <ConnectedDockerContainersSection />

            {/* Development Tools */}
            <DataManagerSection />

            {/* System Settings */}
            <ConnectedLoopManagerSection />
          </main>

          {/* Footer */}
          {/*<footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
              <Typography.Text size="sm" color="muted">
                🍓 Private Hub ver. {this.displayVersion} &copy; {new Date().getFullYear()} •
                Powered by Raspberry Pi
              </Typography.Text>
            </div>
          </footer>*/}
          <Footer />
        </div>

        <NotificationManager />
      </>
    )
  }
}

const mapAppStateToProps = (state: RootState) => ({
  globalError: state.appConfig.error,
  hasErrors: !!(state.containers?.error || state.metrics?.error || state.systemInfo?.error)
})

const mapAppDispatchToProps = () => ({})

export default connect(mapAppStateToProps, mapAppDispatchToProps)(App) 
