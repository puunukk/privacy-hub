import { Component } from 'react'
import { Shield, Search, Globe, ExternalLink, Container, Server, Settings, FileCode } from 'lucide-react'
import { cn } from '@/utils/cn'
import { SearXngModalForm, SearXngSettings } from '@/components/forms'
import SearXNGSettingsForm from '@/components/forms/OriginalVer'

interface QuickAction {
  name: string
  description: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  color: string
  external?: boolean
}

interface QuickActionsState {
  showSearXngConfig: boolean
  showNewSearXngConfig: boolean
  showComprehensiveConfig: boolean
}

export class QuickActions extends Component<{}, QuickActionsState> {
  
  constructor(props: {}) {
    super(props)
    this.state = {
      showSearXngConfig: false,
      showNewSearXngConfig: false,
      showComprehensiveConfig: false
    }
  }

  private quickActions: QuickAction[] = [
    {
      name: 'Pi-hole Admin',
      description: 'DNS filtering and ad blocking',
      icon: <Shield className="w-5 h-5" />,
      href: '/admin',
      color: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      external: true
    },
    {
      name: 'SearXNG Search',
      description: 'Private meta search engine',
      icon: <Search className="w-5 h-5" />,
      href: '/',
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      external: true
    },
    {
      name: 'SearXNG Config (Old)',
      description: 'Original search engine settings',
      icon: <Settings className="w-5 h-5" />,
      onClick: () => this.setState({ showSearXngConfig: true }),
      color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
    },
    {
      name: 'SearXNG Config (New)',
      description: 'Modular form components',
      icon: <Settings className="w-5 h-5" />,
      onClick: () => this.setState({ showNewSearXngConfig: true }),
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
    },
    {
      name: 'SearXNG Config (Comprehensive)',
      description: 'Complete configuration interface',
      icon: <FileCode className="w-5 h-5" />,
      onClick: () => this.setState({ showComprehensiveConfig: true }),
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
    },
    {
      name: 'Container Management',
      description: 'View and manage Docker containers',
      icon: <Container className="w-5 h-5" />,
      onClick: () => {
        // Scroll to containers section or navigate to containers page
        const containersSection = document.getElementById('containers-section')
        if (containersSection) {
          containersSection.scrollIntoView({ behavior: 'smooth' })
        }
      },
      color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    },
    {
      name: 'System Logs',
      description: 'View system and application logs',
      icon: <Server className="w-5 h-5" />,
      onClick: () => {
        // Future: Open logs modal or navigate to logs page
        console.log('System logs - feature coming soon')
      },
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
    }
  ]

  private handleSearXngSave = (settings: SearXngSettings) => {
    console.log('SearXNG settings saved:', settings)
    // TODO: Send settings to backend API for deployment
    this.setState({ showSearXngConfig: false })
  }

  private handleSearXngClose = () => {
    this.setState({ showSearXngConfig: false })
  }

  private handleNewSearXngSave = (settings: SearXngSettings) => {
    console.log('New SearXNG settings saved:', settings)
    // TODO: Send settings to backend API for deployment
    this.setState({ showNewSearXngConfig: false })
  }

  private handleNewSearXngClose = () => {
    this.setState({ showNewSearXngConfig: false })
  }

  private handleComprehensiveClose = () => {
    this.setState({ showComprehensiveConfig: false })
  }

  render() {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Access</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {this.quickActions.map((action, index) => (
            action.href ? (
              <a
                key={index}
                href={action.href}
                target={action.external ? '_blank' : undefined}
                rel={action.external ? 'noopener noreferrer' : undefined}
                className={cn(
                  "block p-4 rounded-lg border transition-all duration-200 hover:shadow-sm",
                  action.color
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    {action.icon}
                  </div>
                  {action.external && (
                    <ExternalLink className="w-4 h-4 opacity-60" />
                  )}
                </div>
                
                <h4 className="font-semibold mb-1">{action.name}</h4>
                <p className="text-sm opacity-80">{action.description}</p>
              </a>
            ) : (
              <button
                key={index}
                onClick={action.onClick}
                className={cn(
                  "block w-full text-left p-4 rounded-lg border transition-all duration-200 hover:shadow-sm",
                  action.color
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    {action.icon}
                  </div>
                </div>
                
                <h4 className="font-semibold mb-1">{action.name}</h4>
                <p className="text-sm opacity-80">{action.description}</p>
              </button>
            )
          ))}
        </div>

        {/* SearXNG Configuration Modal (Old) */}
        <SearXngModalForm
          isOpen={this.state.showSearXngConfig}
          onClose={this.handleSearXngClose}
          onSave={this.handleSearXngSave}
          title="Configure SearXNG Search Engine (Old)"
          size="lg"
        />

        {/* SearXNG Configuration Modal (New) */}
        <SearXngModalForm
          isOpen={this.state.showNewSearXngConfig}
          onClose={this.handleNewSearXngClose}
          onSave={this.handleNewSearXngSave}
          title="Configure SearXNG Search Engine (New)"
          size="lg"
        />

        {/* SearXNG Configuration Modal (Comprehensive) */}
        {this.state.showComprehensiveConfig && (
          <div
            className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={this.handleComprehensiveClose}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SearXNG Configuration (Comprehensive)</h2>
                <button
                  type="button"
                  onClick={this.handleComprehensiveClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(95vh-4rem)]">
                <SearXNGSettingsForm />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}