import { PureComponent } from 'react'
import { Database, Eye, EyeOff } from 'lucide-react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import DataManagerMonitor from '@/components/debug/DataManagerMonitor'

interface DataManagerSectionState {
  isExpanded: boolean
}

export class DataManagerSection extends PureComponent<{}, DataManagerSectionState> {
  constructor(props: {}) {
    super(props)
    this.state = {
      isExpanded: false
    }
  }

  private toggleExpanded = () => {
    this.setState({ isExpanded: !this.state.isExpanded })
  }

  render() {
    const { isExpanded } = this.state

    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') {
      return null
    }

    const actions = [
      {
        label: isExpanded ? 'Collapse' : 'Expand',
        onClick: this.toggleExpanded,
        variant: 'ghost' as const,
        icon: isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
      }
    ]

    return (
      <SectionWrapper
        title="Data Manager Monitor"
        subtitle="Development debugging and monitoring"
        icon={<Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        actions={actions}
        className={isExpanded ? '' : 'opacity-75 hover:opacity-100 transition-opacity'}
      >
        {isExpanded && <DataManagerMonitor className="" />}
        {/*!isExpanded && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Click "Expand" to view data manager monitoring
          </div>
        )}*/}
      </SectionWrapper>
    )
  }
}