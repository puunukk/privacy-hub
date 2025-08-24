import { Component } from 'react'
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

interface NetworkConnectivityTestState {
  tests: {
    hostname: { status: 'pending' | 'success' | 'error'; message?: string; }
    backendHealth: { status: 'pending' | 'success' | 'error'; message?: string; }
    dockerApi: { status: 'pending' | 'success' | 'error'; message?: string; }
    systemMetrics: { status: 'pending' | 'success' | 'error'; message?: string; }
  }
  isRunning: boolean
}

export class NetworkConnectivityTest extends Component<{}, NetworkConnectivityTestState> {
  constructor(props: {}) {
    super(props)
    this.state = {
      tests: {
        hostname: { status: 'pending' },
        backendHealth: { status: 'pending' },
        dockerApi: { status: 'pending' },
        systemMetrics: { status: 'pending' }
      },
      isRunning: false
    }
  }

  private async testEndpoint(url: string): Promise<{ status: 'success' | 'error'; message: string }> {
    try {
      const response = await fetch(url, { 
        method: 'GET', // Changed to GET to get actual response
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        return { status: 'success', message: `✓ Connected successfully (${response.status})` }
      } else {
        return { status: 'error', message: `✗ HTTP ${response.status}: ${response.statusText}` }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { status: 'error', message: '✗ Connection timeout (5s)' }
        }
        if (error.message.includes('CORS')) {
          return { status: 'error', message: '✗ CORS error - check server configuration' }
        }
        if (error.message.includes('network')) {
          return { status: 'error', message: '✗ Network error - check connectivity' }
        }
        return { status: 'error', message: `✗ ${error.message}` }
      }
      return { status: 'error', message: '✗ Unknown network error' }
    }
  }

  private runTests = async () => {
    this.setState({ isRunning: true })

    // Reset all tests to pending
    this.setState({
      tests: {
        hostname: { status: 'pending' },
        backendHealth: { status: 'pending' },
        dockerApi: { status: 'pending' },
        systemMetrics: { status: 'pending' }
      }
    })

    // Test NGINX proxy (basic connectivity)
    const hostnameTest = await this.testEndpoint('/health')
    this.setState(prev => ({
      tests: { ...prev.tests, hostname: hostnameTest }
    }))

    // Test backend health endpoint
    const backendTest = await this.testEndpoint('/pi-system/health')
    this.setState(prev => ({
      tests: { ...prev.tests, backendHealth: backendTest }
    }))

    // Test Docker API
    const dockerTest = await this.testEndpoint('/docker-api/version')
    this.setState(prev => ({
      tests: { ...prev.tests, dockerApi: dockerTest }
    }))

    // Test system metrics
    const metricsTest = await this.testEndpoint('/pi-system/metrics')
    this.setState(prev => ({
      tests: { ...prev.tests, systemMetrics: metricsTest }
    }))

    this.setState({ isRunning: false })
  }

  private getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  render() {
    const { tests, isRunning } = this.state
    const allPassed = Object.values(tests).every(test => test.status === 'success')
    const anyFailed = Object.values(tests).some(test => test.status === 'error')

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {allPassed ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : anyFailed ? (
              <WifiOff className="h-5 w-5 text-red-500" />
            ) : (
              <RefreshCw className="h-5 w-5 text-gray-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Network Connectivity Test
            </h3>
          </div>
          <button
            onClick={this.runTests}
            disabled={isRunning}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            {isRunning ? 'Testing...' : 'Run Tests'}
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              NGINX Proxy Health
            </span>
            <div className="flex items-center space-x-2">
              {this.getStatusIcon(tests.hostname.status)}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tests.hostname.message || 'Not tested'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Backend Health API
            </span>
            <div className="flex items-center space-x-2">
              {this.getStatusIcon(tests.backendHealth.status)}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tests.backendHealth.message || 'Not tested'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Docker API Access
            </span>
            <div className="flex items-center space-x-2">
              {this.getStatusIcon(tests.dockerApi.status)}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tests.dockerApi.message || 'Not tested'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              System Metrics API
            </span>
            <div className="flex items-center space-x-2">
              {this.getStatusIcon(tests.systemMetrics.status)}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tests.systemMetrics.message || 'Not tested'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Testing through NGINX reverse proxy:</strong>
          </p>
          <ul className="text-xs text-gray-500 dark:text-gray-500 mt-2 space-y-1">
            <li>• NGINX Health: /health</li>
            <li>• Backend API: /pi-system/health</li>
            <li>• Docker API: /docker-api/version</li>
            <li>• System Metrics: /pi-system/metrics</li>
          </ul>
        </div>
      </div>
    )
  }
}