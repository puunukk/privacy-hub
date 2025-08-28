import { Component } from 'react'
import { Globe, Settings, Plus } from 'lucide-react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { Tools } from '@/components/dashboard/Tools'

interface QuickAccessSectionState {
  showAddTool: boolean
}

export class QuickAccessSection extends Component<{}, QuickAccessSectionState> {
  constructor(props: {}) {
    super(props)
    this.state = {
      showAddTool: false
    }
  }

  private handleAddTool = () => {
    this.setState({ showAddTool: true })
    // This would open a modal to add new tools
    console.log('Add new tool - feature coming soon')
  }

  private handleManageTools = () => {
    // This would open tools management
    console.log('Manage tools - feature coming soon')
  }

  render() {
    const actions = [
      {
        label: 'Add Tool',
        onClick: this.handleAddTool,
        variant: 'primary' as const,
        icon: <Plus className="w-4 h-4" />
      },
      {
        label: 'Manage',
        onClick: this.handleManageTools,
        variant: 'ghost' as const,
        icon: <Settings className="w-4 h-4" />
      }
    ]

    // Remove wrapper since Tools already has the grid layout
    return (
      <SectionWrapper
        title="Quick Access"
        subtitle="Access your tools and services"
        icon={<Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        actions={actions}
        contentClassName='px-4'
      >
        <Tools />
      </SectionWrapper>
    )
  }
}