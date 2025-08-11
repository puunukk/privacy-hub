import { Component } from 'react'
import { Header } from './components/Header'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorAlert } from './components/ErrorAlert'
import { SystemInfo } from './components/SystemInfo'
import { ContainersTable } from './components/ContainersTable'
import { detectRealNetworkInfo, type RealNetworkInfo } from './utils/network'
import type { DockerContainer, DockerInfo, ContainerAction } from './types/docker'

import { Sun, Moon } from 'lucide-react'

interface AppState {
  containers: DockerContainer[]
  dockerInfo: DockerInfo | null
  networkInfo: RealNetworkInfo | null
  loading: boolean
  error: string | null
  actionLoading: string | null
  apiUnavailable: boolean
  isDark: boolean
}

class App extends Component<{}, AppState> {
  private intervalId: number | null = null

  constructor(props: {}) {
    super(props)
    this.state = {
      containers: [],
      dockerInfo: null,
      networkInfo: null,
      loading: true,
      error: null,
      actionLoading: null,
      apiUnavailable: false,
      isDark: false
    }
  }

  componentDidMount() {
    this.loadData()
    this.loadNetworkInfo()
    // Only start polling after initial load succeeds
    setTimeout(() => {
      if (!this.state.apiUnavailable) {
        this.intervalId = setInterval(this.loadData, 5000)
      }
    }, 1000)
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  loadData = async () => {
    // Don't run if API is unavailable
    if (this.state.apiUnavailable) return
    
    this.setState({ loading: true })
    
    try {
      const [containersResponse, infoResponse] = await Promise.all([
        fetch('/api/docker/containers/json?all=true'),
        fetch('/api/docker/info')
      ])

      if (!containersResponse.ok || !infoResponse.ok) {
        throw new Error('Failed to fetch Docker data')
      }

      const containers = await containersResponse.json()
      const dockerInfo = await infoResponse.json()

      this.setState({
        containers,
        dockerInfo,
        loading: false,
        error: null,
        apiUnavailable: false
      })
    } catch (error) {
      console.warn('Docker API unavailable - stopping polling:', error)
      
      // Stop polling when API is unavailable (standalone mode)
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
      
      this.setState({
        error: 'Running in standalone mode - Docker API not available',
        loading: false,
        apiUnavailable: true,
        containers: [],
        dockerInfo: null
      })
    }
  }

  loadNetworkInfo = async () => {
    try {
      const info = await detectRealNetworkInfo()
      this.setState({ networkInfo: info })
    } catch (error) {
      console.error('Failed to load network info:', error)
    }
  }
  toggleTheme = () => {
    const { isDark } = this.state
    const newIsDark = !isDark
    
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    
    this.setState({ isDark: newIsDark })
  }
  handleContainerAction = async (containerId: string, action: ContainerAction) => {
    this.setState({ actionLoading: containerId })
    
    try {
      const response = await fetch(`/api/docker/containers/${containerId}/${action}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} container`)
      }
      
      // Refresh data after action
      await this.loadData()
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      this.setState({ actionLoading: null })
    }
  }

  refresh = () => {
    this.setState({ loading: true })
    this.loadData()
  }

  render() {
    const { containers, dockerInfo, networkInfo, loading, error, actionLoading, isDark } = this.state

    if (loading) {
      return <LoadingSpinner />
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header onRefresh={this.refresh} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && <ErrorAlert error={error} />}
            <button
                onClick={this.toggleTheme}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <SystemInfo dockerInfo={dockerInfo} networkInfo={networkInfo} />
          
            <ContainersTable
                containers={containers}
                actionLoading={actionLoading}
                onAction={this.handleContainerAction}
            />
        </main>
      </div>
    )
  }
}

export default App