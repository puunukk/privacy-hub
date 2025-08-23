import { Component } from 'react'
import type { DockerInfo } from '@/types/docker'

interface ResourcesSummaryProps {
  dockerInfo: DockerInfo
}

export class ResourcesSummary extends Component<ResourcesSummaryProps> {
  render() {
    const { dockerInfo } = this.props

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Resources
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">CPU Cores:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.NCPU}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Memory:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round(dockerInfo.MemTotal / 1024 / 1024 / 1024)} GB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Images:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.Images}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Running Containers:</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">{dockerInfo.ContainersRunning}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Stopped Containers:</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{dockerInfo.ContainersStopped}</span>
          </div>
        </div>
      </div>
    )
  }
}