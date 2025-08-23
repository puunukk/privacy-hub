import { Component, ReactNode } from 'react'
import { Shield, Search, Server, Globe, ExternalLink } from 'lucide-react'

interface QuickLink {
  name: string
  url: string
  icon: ReactNode
  color: string
  onClick?: () => void
}

interface QuickAccessLinksProps {
  baseUrl: string
  isDevelopment: boolean
  onSearxngConfig: () => void
}

export class QuickAccessLinks extends Component<QuickAccessLinksProps> {
  private getQuickLinks(): QuickLink[] {
    const { baseUrl, isDevelopment, onSearxngConfig } = this.props

    return [
      {
        name: 'Pi-hole Admin',
        url: `${baseUrl}/admin`,
        icon: <Shield className="w-4 h-4" />,
        color: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
      },
      {
        name: 'SearXNG Search',
        url: `${baseUrl}/`,
        icon: <Search className="w-4 h-4" />,
        color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
      },
      {
        name: 'System Dashboard',
        url: isDevelopment ? `${window.location.protocol}//localhost:${window.location.port}/` : '/dashboard/',
        icon: <Server className="w-4 h-4" />,
        color: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800'
      },
      {
        name: '🔧 Configure SearXNG',
        url: '#',
        icon: <Globe className="w-4 h-4" />,
        color: 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800',
        onClick: onSearxngConfig
      }
    ]
  }

  render() {
    const quickLinks = this.getQuickLinks()

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Quick Access
        </h3>
        <div className="space-y-2">
          {quickLinks.map((link) => (
            link.onClick ? (
              <button
                type="button"
                key={link.name}
                onClick={link.onClick}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-sm ${link.color}`}
              >
                <div className="flex items-center space-x-3">
                  {link.icon}
                  <span className="text-sm font-medium">{link.name}</span>
                </div>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </button>
            ) : (
              <a
                key={link.name}
                href={link.url}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-sm ${link.color}`}
              >
                <div className="flex items-center space-x-3">
                  {link.icon}
                  <span className="text-sm font-medium">{link.name}</span>
                </div>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            )
          ))}
        </div>
      </div>
    )
  }
}