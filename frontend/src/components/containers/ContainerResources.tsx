import { Component } from 'react'
import { Text } from '@/components/ui/Typography'

interface ContainerResourcesProps {
  containerState: string
  cpuUsage?: string
  memUsage?: string
  compact?: boolean
}

export class ContainerResources extends Component<ContainerResourcesProps> {
  render() {
    const { containerState, cpuUsage, memUsage, compact = false } = this.props
    const isRunning = containerState === 'running'

    if (compact) {
      return (
        <>
          <div title={isRunning ?
            `CPU Usage: ${cpuUsage || 'Not available'}\nReal-time CPU consumption` :
            'CPU usage only available when container is running'
          }>
            <Text size="xs" className="inline">
              CPU: <Text 
                size="xs" 
                weight="medium" 
                color={isRunning ? "info" : "muted"}
                className="inline"
              >
                {isRunning ? (cpuUsage || '~') : '-'}
              </Text>
            </Text>
          </div>
          <div title={isRunning ?
            `Memory Usage: ${memUsage || 'Not available'}\nReal-time memory consumption` :
            'Memory usage only available when container is running'
          }>
            <Text size="xs" className="inline">
              MEM: <Text 
                size="xs" 
                weight="medium" 
                color={isRunning ? "success" : "muted"}
                className="inline"
              >
                {isRunning ? (memUsage || '~') : '-'}
              </Text>
            </Text>
          </div>
        </>
      )
    }

    return (
      <div className="space-y-2">
        <Text size="xs" weight="medium" color="secondary" className="uppercase tracking-wide">
          Resources
        </Text>
        <div className="grid grid-cols-2 gap-2">
          <div title={isRunning ?
            `CPU Usage: ${cpuUsage || 'Not available'}\nReal-time CPU consumption` :
            'CPU usage only available when container is running'
          }>
            <Text size="xs" className="inline">
              CPU: <Text 
                size="xs" 
                weight="medium" 
                color={isRunning ? "info" : "muted"}
                className="inline"
              >
                {isRunning ? (cpuUsage || '~') : '-'}
              </Text>
            </Text>
          </div>
          <div title={isRunning ?
            `Memory Usage: ${memUsage || 'Not available'}\nReal-time memory consumption` :
            'Memory usage only available when container is running'
          }>
            <Text size="xs" className="inline">
              MEM: <Text 
                size="xs" 
                weight="medium" 
                color={isRunning ? "success" : "muted"}
                className="inline"
              >
                {isRunning ? (memUsage || '~') : '-'}
              </Text>
            </Text>
          </div>
        </div>
      </div>
    )
  }
}