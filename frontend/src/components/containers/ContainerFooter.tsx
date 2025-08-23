import { Component } from 'react'
import { formatUptime } from '@/utils/formatUptime'
import ContainerActions from './ContainerActions'
import { cn } from '@/utils/cn'

interface ContainerFooterProps {
  containerId: string
  containerName: string
  containerImage: string
  containerState: string
  created: number
  onShowLogs?: (containerId: string, containerName: string) => void
}

export class ContainerFooter extends Component<ContainerFooterProps> {
  render() {
    const { containerId, containerName, containerImage, containerState, created, onShowLogs } = this.props
    const createdDate = new Date(created * 1000)

    return (
      <div className={cn(
        "flex items-center justify-between",
        "pt-3 border-t border-gray-100 dark:border-gray-700"
      )}>
        <div
          className="text-xs text-gray-500 dark:text-gray-400"
          title={`Container uptime since last start\nCreated: ${createdDate.toLocaleString()}\nRunning for: ${formatUptime(created)}`}
        >
          <span className="font-medium">Uptime:</span> {formatUptime(created)}
        </div>
        <ContainerActions
          containerId={containerId}
          containerName={containerName}
          containerImage={containerImage}
          containerState={containerState}
          onShowLogs={onShowLogs}
        />
      </div>
    )
  }
}