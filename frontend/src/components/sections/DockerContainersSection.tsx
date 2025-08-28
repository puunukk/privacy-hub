import { PureComponent, createRef, RefObject } from 'react'
import { connect } from 'react-redux'
import { Container, RefreshCw, Play, Square, Grid3X3, List } from 'lucide-react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { ConnectedContainersTable } from '@/components/ContainersTableNew'
import { ContainerActionTypes } from '@/store/docker/types'
import type { RootState } from '@/store'
import type { Dispatch } from '@reduxjs/toolkit'

interface DockerContainersSectionProps {
  containers: any[]
  isLoading: boolean
  dispatch: Dispatch
}

interface DockerContainersSectionState {
  viewMode: 'grid' | 'list'
}

class DockerContainersSection extends PureComponent<DockerContainersSectionProps, DockerContainersSectionState> {
  private tableRef: RefObject<any> = createRef()

  constructor(props: DockerContainersSectionProps) {
    super(props)
    this.state = {
      viewMode: 'list'
    }
  }

  private handleRefreshContainers = () => {
    this.props.dispatch({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST })
  }

  private handleStartAll = () => {
    // This would need to be implemented in the saga
    console.log('Start all containers - feature coming soon')
  }

  private handleStopAll = () => {
    // This would need to be implemented in the saga
    console.log('Stop all containers - feature coming soon')
  }

  private toggleViewMode = () => {
    this.setState(prev => ({
      viewMode: prev.viewMode === 'grid' ? 'list' : 'grid'
    }))
    // Pass the view mode to the table component
    if (this.tableRef.current && this.tableRef.current.toggleView) {
      this.tableRef.current.toggleView()
    }
  }

  render() {
    const { containers } = this.props
    const { viewMode } = this.state
    const runningCount = containers.filter(c => c.State === 'running').length
    const totalCount = containers.length

    const actions = [
      {
        label: viewMode === 'list' ? 'Grid View' : 'List View',
        onClick: this.toggleViewMode,
        variant: 'ghost' as const,
        icon: viewMode === 'list' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />
      },
      {
        label: 'Refresh',
        onClick: this.handleRefreshContainers,
        variant: 'ghost' as const,
        icon: <RefreshCw className="w-4 h-4" />
      },
      {
        label: 'Start All',
        onClick: this.handleStartAll,
        variant: 'primary' as const,
        icon: <Play className="w-4 h-4" />
      },
      {
        label: 'Stop All',
        onClick: this.handleStopAll,
        variant: 'danger' as const,
        icon: <Square className="w-4 h-4" />
      }
    ]

    return (
      <SectionWrapper
        id="containers-section"
        title="Docker Containers"
        subtitle={`${runningCount} running / ${totalCount} total containers`}
        icon={<Container className="w-5 h-5 text-green-600 dark:text-green-400" />}
        actions={actions}
        //className="bg-gray-50 dark:bg-gray-900"
        contentClassName="px-4"
      >
        <ConnectedContainersTable ref={this.tableRef} viewMode={viewMode} />
      </SectionWrapper>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  containers: state.containers?.containers || [],
  isLoading: state.containers?.isLoading || false
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
})

export const ConnectedDockerContainersSection = connect(mapStateToProps, mapDispatchToProps)(DockerContainersSection)