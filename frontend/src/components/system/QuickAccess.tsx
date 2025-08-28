import { Component, ReactNode } from 'react'
import { Shield, Search, Globe, ExternalLink, Settings, FileCode } from 'lucide-react'
import { SearXngConfig } from './SearxngConfig'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SearXngModalForm, SearXngSettings } from '@/components/forms'
import SearXNGSettingsForm from '@/components/forms/OriginalVer'

interface QuickAccessState {
  showSearxngConfig: boolean
  showNewSearxngConfig: boolean
  showComprehensiveConfig: boolean
}

export class QuickAccess extends Component<{}, QuickAccessState> {

  state: QuickAccessState = {
    showSearxngConfig: false,
    showNewSearxngConfig: false,
    showComprehensiveConfig: false
  }

  openSearxngConfig = () => {
    this.setState({ showSearxngConfig: true })
  }

  closeSearxngConfig = () => {
    this.setState({ showSearxngConfig: false })
  }

  openNewSearxngConfig = () => {
    this.setState({ showNewSearxngConfig: true })
  }

  closeNewSearxngConfig = () => {
    this.setState({ showNewSearxngConfig: false })
  }

  handleNewSearXngSave = (settings: SearXngSettings) => {
    console.log('New SearXNG settings saved:', settings)
    // TODO: Send settings to backend API for deployment
    this.setState({ showNewSearxngConfig: false })
  }

  openComprehensiveConfig = () => {
    this.setState({ showComprehensiveConfig: true })
  }

  closeComprehensiveConfig = () => {
    this.setState({ showComprehensiveConfig: false })
  }

  render() {
    const { showSearxngConfig, showNewSearxngConfig, showComprehensiveConfig } = this.state

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
        },
        {
          name: 'Configure SearXNG (New)',
          url: '#',
          icon: <Settings className="w-5 h-5" />,
          color: 'text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800 dark:hover:bg-orange-900/30',
          onClick: this.openNewSearxngConfig
        },
        {
          name: 'Configure SearXNG (Comprehensive)',
          url: '#',
          icon: <FileCode className="w-5 h-5" />,
          color: 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800 dark:hover:bg-emerald-900/30',
          onClick: this.openComprehensiveConfig
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
        <Modal
          isOpen={showSearxngConfig}
          onClose={this.closeSearxngConfig}
          title="SearXNG Configuration"
          size="lg"
        >
          <SearXngConfig />
        </Modal>

        {/* New SearXNG Config Modal */}
        <SearXngModalForm
          isOpen={showNewSearxngConfig}
          onClose={this.closeNewSearxngConfig}
          onSave={this.handleNewSearXngSave}
          title="Configure SearXNG Search Engine (New)"
          size="lg"
        />

        <Modal
          isOpen={showComprehensiveConfig}
          onClose={this.closeComprehensiveConfig}
          title="SearXNG Configuration (Comprehensive)"
          size="lg"
        >
          <SearXNGSettingsForm />
        </Modal>
      </>
    )
  }
}
