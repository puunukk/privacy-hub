import { Component, ReactNode } from 'react'
import { Shield, Search, Globe, ExternalLink } from 'lucide-react'
import { SearxngConfig } from './SearxngConfig'
import { Button } from './ui/Button'

interface QuickAccessState {
  showSearxngConfig: boolean
}

export class QuickAccess extends Component<{}, QuickAccessState> {

  state: QuickAccessState = {
    showSearxngConfig: false
  }

  openSearxngConfig = () => {
    this.setState({ showSearxngConfig: true })
  }

  closeSearxngConfig = () => {
    this.setState({ showSearxngConfig: false })
  }

  render() {
    const { showSearxngConfig } = this.state

    // Detect if we're in development or production  
    const isDevelopment = window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443'
    // In production, nginx handles all routing, so use relative paths
    const baseUrl = isDevelopment ? `${window.location.protocol}//localhost:${window.location.port}` : ''

    const quickLinks: Array<{
      name: string
      url: string
      icon: ReactNode
      color: string
      onClick?: () => void
    }> = [
        {
          name: 'Pi-hole Admin',
          url: `${baseUrl}/admin`,
          icon: <Shield className="w-5 h-5" />,
          color: 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30'
        },
        {
          name: 'SearXNG Search',
          url: `${baseUrl}/`,
          icon: <Search className="w-5 h-5" />,
          color: 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:hover:bg-blue-900/30'
        },
        // {
        //   name: 'System Dashboard',
        //   url: isDevelopment ? `${window.location.protocol}//localhost:${window.location.port}/` : '/dashboard/',
        //   icon: <Server className="w-5 h-5" />,
        //   color: 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800 dark:hover:bg-green-900/30'
        // },
        {
          name: 'Configure SearXNG',
          url: '#',
          icon: <Globe className="w-5 h-5" />,
          color: 'text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800 dark:hover:bg-purple-900/30',
          onClick: this.openSearxngConfig
        }
      ]

    return (
      <>
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {quickLinks.map((link) => (
              link.onClick ? (
                <Button
                  variant="primary"
                  key={link.name}
                  onClick={link.onClick}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-lg border transition-all duration-200 hover:shadow-md ${link.color}`}
                >
                  {link.icon}
                  <span className="font-medium">{link.name}</span>
                  {/* <ExternalLink className="w-4 h-4 opacity-50" /> */}
                </Button>
              ) : (
                <a
                  key={link.name}
                  href={link.url}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-lg border transition-all duration-200 hover:shadow-md ${link.color}`}
                >
                  {link.icon}
                  <span className="font-medium">{link.name}</span>
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              )
            ))}
          </div>
        </div>

        {/* SearXNG Config Modal */}
        {showSearxngConfig && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={this.closeSearxngConfig}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SearXNG ConfigurationXX</h2>
                <button
                  type="button"
                  onClick={this.closeSearxngConfig}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              <SearxngConfig />
            </div>
          </div>
        )}
      </>
    )
  }
}
