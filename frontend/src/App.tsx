import { Component } from 'react'
import { connect } from 'react-redux'

import { ErrorAlert, NotificationManager } from '@/components/shared'
import { QuickAccessSection } from '@/components/sections/QuickAccessSection'
import { ConnectedDockerContainersSection } from '@/components/sections/DockerContainersSection'
import { getDisplayVersion } from '@/utils/version'
import { cn } from '@/utils/cn'
import type { RootState } from '@/store'

import { ConnectedSystemOverview } from '@/connectedComponents/SystemOverview'
import { ConnectedLoopManagerSection } from '@/connectedComponents/LoopManagerSection'
import DataManagerSection from '@/connectedComponents/DataManagerSection'
import Header from '@/connectedComponents/ApplicationHeader'

import DevTest from '@/DevTest'
import Footer from '@/components/Footer'

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
      hasErrors && 'from-red-50 to-red-100 dark:from-red-900 dark:to-red-800'
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

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            { // Show connection error for critical failures
              (hasErrors && globalError) && (
                <div className="flex items-center justify-center text-center animate-fade-in">
                  <ErrorAlert error={globalError} />
                </div>
              )
            }

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
