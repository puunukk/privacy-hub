import { Component } from 'react'
import type { DockerContainer } from '@/types/docker'
import { ContainerCard } from './ContainerCard'
import { ContainerListItem } from './ContainerListItem'

interface ContainerRowProps {
  container: DockerContainer
  viewMode?: 'grid' | 'list'
  onShowLogs?: (containerId: string, containerName: string) => void
}

export class ContainerRow extends Component<ContainerRowProps> {
  render() {
    const { container, viewMode = 'grid', onShowLogs } = this.props

    if (viewMode === 'grid') {
      return (
        <ContainerCard 
          container={container}
          onShowLogs={onShowLogs}
        />
      )
    }

    return (
      <ContainerListItem 
        container={container}
        onShowLogs={onShowLogs}
      />
    )
  }
}