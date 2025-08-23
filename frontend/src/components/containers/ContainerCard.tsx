import { Component } from 'react'
import type { DockerContainer } from '@/types/docker'
import { getContainerStatus } from '@/utils/containerStatus'
import { parseImageName } from '@/utils/parseImageName'
import { ContainerHeader } from './ContainerHeader'
import { ContainerImage } from './ContainerImage'
import { ContainerNetworkInfo } from './ContainerNetworkInfo'
import { ContainerResources } from './ContainerResources'
import { ContainerFooter } from './ContainerFooter'
import { cn } from '@/utils/cn'

interface ContainerCardProps {
  container: DockerContainer
  onShowLogs?: (containerId: string, containerName: string) => void
}

export class ContainerCard extends Component<ContainerCardProps> {
  render() {
    const { container, onShowLogs } = this.props
    const status = getContainerStatus(container.State)
    const name = container.Names[0]?.replace(/^\//, '') || 'Unknown'
    const { name: imageName, tag: imageTag } = parseImageName(container.Image)

    const networks = container.NetworkSettings?.Networks || {}
    const networkNames = Object.keys(networks)
    const primaryNetwork = networkNames[0]
    const containerIP = primaryNetwork ? networks[primaryNetwork]?.IPAddress : null

    const portsWithDetails = container.Ports.map(port => ({
      ...port,
      displayText: port.PublicPort ?
        `${port.IP || '0.0.0.0'}:${port.PublicPort}→${port.PrivatePort}/${port.Type}` :
        `${port.PrivatePort}/${port.Type}`,
      isPublic: !!port.PublicPort,
      hostIP: port.IP || '0.0.0.0'
    }))

    const createdDate = new Date(container.Created * 1000)
    const now = new Date()
    const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

    const cardClasses = cn(
      "bg-white dark:bg-gray-800",
      "rounded-xl shadow-sm",
      "border border-gray-200 dark:border-gray-700",
      "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
      "transition-all duration-200",
      "p-4 space-y-4"
    )

    return (
      <div className={cardClasses}>
        <ContainerHeader 
          name={name}
          containerId={container.Id}
          containerNames={container.Names}
          status={status}
          containerState={container.State}
          containerStatus={container.Status}
        />

        <ContainerImage 
          imageName={imageName}
          imageTag={imageTag}
          fullImage={container.Image}
        />

        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Container Info
          </div>
          <div className="space-y-2">
            <div className="text-xs">
              <div title={`Container was created ${ageInDays} days ago\nCreated: ${createdDate.toLocaleString()}`}>
                Created: <span className="font-medium text-gray-600 dark:text-gray-400">
                  {ageInDays === 0 ? 'Today' : `${ageInDays} days ago`}
                </span>
              </div>
            </div>

            <ContainerNetworkInfo 
              containerIP={containerIP}
              primaryNetwork={primaryNetwork}
              ports={portsWithDetails}
            />
          </div>
        </div>

        <ContainerResources 
          containerState={container.State}
          cpuUsage={container?.cpuUsage}
          memUsage={container?.memUsage}
        />

        <ContainerFooter 
          containerId={container.Id}
          containerName={name}
          containerImage={container.Image}
          containerState={container.State}
          created={container.Created}
          onShowLogs={onShowLogs}
        />
      </div>
    )
  }
}