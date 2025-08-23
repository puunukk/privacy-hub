import { Component } from 'react'
import { cn } from '@/utils/cn'

interface Port {
  PrivatePort: number
  PublicPort?: number
  Type: string
  IP?: string
  displayText: string
  isPublic: boolean
  hostIP: string
}

interface ContainerNetworkInfoProps {
  containerIP: string | null
  primaryNetwork: string | undefined
  ports: Port[]
}

export class ContainerNetworkInfo extends Component<ContainerNetworkInfoProps> {
  render() {
    const { containerIP, primaryNetwork, ports } = this.props

    if (!containerIP && ports.length === 0) {
      return null
    }

    return (
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
        {containerIP && (
          <div className="flex items-center space-x-2 text-xs mb-2">
            <span className="text-gray-600 dark:text-gray-400">IP:</span>
            <span
              className="font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
              title={`Internal container IP: ${containerIP}\nNetwork: ${primaryNetwork || 'default'}`}
            >
              {containerIP}
            </span>
            {primaryNetwork && (
              <span
                className="text-gray-500 dark:text-gray-400"
                title={`Docker network: ${primaryNetwork}`}
              >
                ({primaryNetwork})
              </span>
            )}
          </div>
        )}

        {ports.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-600 dark:text-gray-400">Ports:</div>
            <div className="flex flex-wrap gap-1">
              {ports.map((port, index) => (
                <span
                  key={index}
                  className={cn(
                    "inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-mono",
                    port.isPublic
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}
                  title={port.isPublic
                    ? `Public port: External ${port.hostIP}:${port.PublicPort} → container port ${port.PrivatePort}/${port.Type}`
                    : `Internal port: Container port ${port.PrivatePort}/${port.Type} (not publicly exposed)`
                  }
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    port.isPublic ? "bg-green-500" : "bg-gray-400"
                  )} />
                  <span>{port.displayText}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
}