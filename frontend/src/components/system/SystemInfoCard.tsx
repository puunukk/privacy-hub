import { Component } from 'react'
import type { DockerInfo } from '@/types/docker'

interface SystemInfoCardProps {
  dockerInfo: DockerInfo
}

export class SystemInfoCard extends Component<SystemInfoCardProps> {
  render() {
    const { dockerInfo } = this.props

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          System Info
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Docker Version:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.ServerVersion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">OS:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.OperatingSystem}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Architecture:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{dockerInfo.Architecture}</span>
          </div>
        </div>
      </div>
    )
  }
}