import { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Server, Settings } from 'lucide-react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { StorageOverview } from '@/components/dashboard/StorageOverview'
import { NetworkInfo } from '@/components/dashboard/NetworkInfo'
import { SystemActionsModal } from '@/components/dashboard/SystemActionsModal'
import type { RootState } from '@/store'

interface SystemInfoSectionProps {
  systemMetrics: any
  systemInfo: any
  dockerInfo: any
  containers: any[]
  isLoading: boolean
}

interface SystemInfoSectionState {
  showSystemModal: boolean
}

class SystemInfoSection extends PureComponent<SystemInfoSectionProps, SystemInfoSectionState> {
  constructor(props: SystemInfoSectionProps) {
    super(props)
    this.state = {
      showSystemModal: false
    }
  }

  private openSystemModal = () => {
    this.setState({ showSystemModal: true })
  }

  private closeSystemModal = () => {
    this.setState({ showSystemModal: false })
  }

  private getContainerStats = () => {
    const { containers } = this.props
    const running = containers?.filter(c => c.State === 'running').length || 0
    const total = containers?.length || 0

    let totalMemoryUsage = 0
    let totalMemoryLimit = 0

    if (containers) {
      containers.forEach(container => {
        if (container.State === 'running' && container.Stats) {
          const memUsage = container.Stats.memory_usage || 0
          const memLimit = container.Stats.memory_limit || 0
          totalMemoryUsage += memUsage
          totalMemoryLimit += memLimit
        }
      })
    }

    return {
      running,
      total,
      memoryUsage: totalMemoryUsage,
      memoryLimit: totalMemoryLimit,
      memoryPercent: totalMemoryLimit > 0 ? (totalMemoryUsage / totalMemoryLimit) * 100 : 0
    }
  }

  render() {
    const { systemMetrics, systemInfo, dockerInfo, isLoading } = this.props
    const containerStats = this.getContainerStats()

    const actions = [
      {
        label: 'Pi Commands',
        onClick: this.openSystemModal,
        variant: 'primary' as const,
        icon: <Settings className="w-4 h-4" />
      }
    ]

    return (
      <>
        <SectionWrapper
          title={`🍓 ${systemInfo?.hostname || 'Privacy Hub'}`}
          subtitle={
            systemInfo?.ip && systemInfo?.uptime
              ? `${systemInfo.ip} • Uptime: ${systemInfo.uptime}`
              : 'System Information'
          }
          icon={<Server className="w-5 h-5 text-green-600 dark:text-green-400" />}
          actions={actions}
          contentClassName="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Detailed Storage */}
          <StorageOverview
            storage={systemMetrics?.storage}
            isLoading={isLoading}
          />

          {/* Network & System Info */}
          <NetworkInfo
            systemInfo={systemInfo}
            dockerInfo={dockerInfo}
            containers={containerStats}
            isLoading={isLoading}
          />
        </SectionWrapper>

        {/* System Actions Modal */}
        {this.state.showSystemModal && (
          <SystemActionsModal
            isOpen={this.state.showSystemModal}
            onClose={this.closeSystemModal}
            hostname={systemInfo?.hostname}
          />
        )}
      </>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  systemMetrics: state.metrics?.data || null,
  systemInfo: state.systemInfo?.data || null,
  dockerInfo: state.containers?.dockerInfo || null,
  containers: state.containers?.containers || [],
  isLoading: state.metrics?.status === 'LOADING' || state.systemInfo?.status === 'LOADING'
})

export const ConnectedSystemInfoSection = connect(mapStateToProps)(SystemInfoSection)