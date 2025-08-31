import { Component } from 'react'
import { Shield, Search, Container, Server, Settings, FileCode, Workflow } from 'lucide-react'
import { SearXngModalForm, SearXngSettings } from '@/components/forms'
import SearXNGSettingsForm from '@/components/forms/OriginalVer'
import { ToolCard } from './ToolCard'
import { Modal } from '@/components/ui/Modal'

interface ToolsState {
  showSearXngConfig: boolean
  showNewSearXngConfig: boolean
  showComprehensiveConfig: boolean
}

export class Tools extends Component<{}, ToolsState> {

  constructor(props: {}) {
    super(props)
    this.state = {
      showSearXngConfig: false,
      showNewSearXngConfig: false,
      showComprehensiveConfig: false
    }
  }

  private tools = [
    {
      id: 'searxng',
      name: 'SearXNG',
      description: 'Private meta search engine',
      icon: <Search className="w-6 h-6" />,
      external: true,
      actions: [
        {
          name: 'Search Interface',
          description: 'Access the search engine',
          icon: <Search className="w-4 h-4" />,
          onClick: () => window.open('/', '_blank'),
          variant: 'primary' as const
        },
        {
          name: 'Basic Config',
          description: 'Simple configuration',
          icon: <Settings className="w-4 h-4" />,
          onClick: () => this.setState({ showNewSearXngConfig: true }),
          variant: 'secondary' as const
        },
        {
          name: 'Advanced Config',
          description: 'Complete configuration interface',
          icon: <FileCode className="w-4 h-4" />,
          onClick: () => this.setState({ showComprehensiveConfig: true }),
          variant: 'ghost' as const
        }
      ]
    },
    {
      id: 'pihole',
      name: 'Pi-hole',
      description: 'DNS filtering and ad blocking',
      icon: <Shield className="w-6 h-6" />,
      external: true,
      actions: [
        {
          name: 'Admin Panel',
          description: 'Manage DNS filtering',
          icon: <Shield className="w-4 h-4" />,
          onClick: () => window.open('/admin', '_blank'),
          variant: 'danger' as const
        },
        {
          name: 'Admin Panel under subdomain',
          description: 'Manage DNS filtering',
          icon: <Shield className="w-4 h-4" />,
          onClick: () => window.open('https://pihole.otsi.local/admin', '_blank'),
          variant: 'danger' as const
        }
      ]
    },
    {
      id: 'docker',
      name: 'Docker',
      description: 'Container management',
      icon: <Container className="w-6 h-6" />,
      actions: [
        {
          name: 'Container List',
          description: 'View and manage containers',
          icon: <Container className="w-4 h-4" />,
          onClick: () => {
            const containersSection = document.getElementById('containers-section')
            containersSection?.scrollIntoView({ behavior: 'smooth' })
          },
          variant: 'primary' as const
        },
        {
          name: 'System Logs',
          description: 'View container logs',
          icon: <Server className="w-4 h-4" />,
          onClick: () => console.log('System logs - feature coming soon'),
          variant: 'ghost' as const
        }
      ]
    },
    {
      id: 'n8n',
      name: 'N8N',
      description: 'Workflow automation (coming soon)',
      icon: <Workflow className="w-6 h-6" />,
      actions: [
        {
          name: 'Workflows',
          description: 'Create and manage workflows',
          icon: <Workflow className="w-4 h-4" />,
          onClick: () => console.log('N8N integration - coming soon'),
          variant: 'warning' as const
        }
      ]
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
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {this.tools.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
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

        <Modal
          isOpen={this.state.showComprehensiveConfig}
          onClose={this.handleComprehensiveClose}
          title="SearXNG Configuration (Comprehensive)"
          size="lg"
        >
          <SearXNGSettingsForm />
        </Modal>
      </>
    )
  }
}