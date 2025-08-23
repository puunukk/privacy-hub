import { Component } from 'react'
import { cn } from '@/utils/cn'

interface ContainerHeaderProps {
  name: string
  containerId: string
  containerNames: string[]
  status: {
    text: string
    color: string
    icon: React.ReactNode
  }
  containerState: string
  containerStatus: string
}

export class ContainerHeader extends Component<ContainerHeaderProps> {
  render() {
    const { name, containerId, containerNames, status, containerState, containerStatus } = this.props

    const headerClasses = cn(
      "flex items-start justify-between",
      "pb-3 border-b border-gray-100 dark:border-gray-700"
    )

    const nameClasses = cn(
      "text-sm font-semibold text-gray-900 dark:text-white",
      "truncate"
    )

    const idClasses = cn(
      "text-xs text-gray-500 dark:text-gray-400",
      "font-mono"
    )

    const statusClasses = cn(
      "flex items-center space-x-2",
      status.color
    )

    return (
      <div className={headerClasses}>
        <div className="flex-1 min-w-0">
          <div
            className={nameClasses}
            title={`Container Name: ${name}\nFull Names: ${containerNames.join(', ')}`}
          >
            {name}
          </div>
          <div
            className={idClasses}
            title={`Full Container ID: ${containerId}\nShort ID: ${containerId.substring(0, 12)}`}
          >
            {containerId.substring(0, 12)}
          </div>
        </div>
        <div
          className={statusClasses}
          title={`Container Status: ${containerState}\nDetailed Status: ${containerStatus}`}
        >
          {status.icon}
          <span className="text-sm font-medium">{status.text}</span>
        </div>
      </div>
    )
  }
}