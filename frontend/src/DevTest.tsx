/**
 * Development Test Component
 * This helps verify the frontend development setup is working
 */

import { Component } from 'react'
import { ServiceStatusIndicator } from '@/components/shared/ServiceStatusIndicator'

interface DevTestState {
  count: number;
  apiStatus: 'checking' | 'ok' | 'error';
}

export class DevTest extends Component<{}, DevTestState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      count: 0,
      apiStatus: 'checking'
    };
  }

  componentDidMount() {
    // Test API connectivity
    this.testApi();
  }

  testApi = async () => {
    try {
      const response = await fetch('/pi-system/health')
      if (response.ok) {
        this.setState({ apiStatus: 'ok' });
      } else {
        this.setState({ apiStatus: 'error' });
      }
    } catch (error) {
      this.setState({ apiStatus: 'error' });
    }
  }

  incrementCount = () => {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    const { count, apiStatus } = this.state;

    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              🧪 Frontend Dev Test
            </h1>

            {/* HMR Test */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Hot Module Reload Test
              </h2>
              <p className="text-blue-700 dark:text-blue-300 mb-3">
                Click the button and then edit this file to test HMR:
              </p>
              <button
                onClick={this.incrementCount}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Count: {count} 🚀
              </button>
            </div>

            {/* API Test */}
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                API Connection Test
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-green-700 dark:text-green-300">Status:</span>
                {apiStatus === 'checking' && (
                  <span className="text-yellow-600">🔄 Checking...</span>
                )}
                {apiStatus === 'ok' && (
                  <span className="text-green-600">✅ Connected</span>
                )}
                {apiStatus === 'error' && (
                  <span className="text-red-600">❌ Connection failed</span>
                )}
              </div>
            </div>

            {/* Service Status */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Real-time Service Status
              </h2>
              <ServiceStatusIndicator showDetails className="w-full" />
            </div>

            {/* Environment Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Environment Info
              </h2>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Node ENV: {process.env.NODE_ENV}</li>
                <li>• Vite HMR: {import.meta.hot ? '✅ Enabled' : '❌ Disabled'}</li>
                <li>• Time: {new Date().toLocaleTimeString()}</li>
                <li>• Base URL: {window.location.origin}</li>
                <li>• Frontend: Always online ✅</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DevTest