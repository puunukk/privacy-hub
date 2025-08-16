import { Component } from 'react'
import type { DockerContainer } from '../types/docker'
import { getContainerStatus } from '../utils/containerStatus'
import { formatUptime } from '../utils/formatUptime'
import { parseImageName } from '../utils/parseImageName'
import ContainerActions from './ContainerActions'
import { cn } from '../utils/cn'

interface ContainerRowProps {
  container: DockerContainer
  viewMode?: 'grid' | 'list'
  onShowLogs?: (containerId: string, containerName: string) => void
}

interface ContainerRowState { }

export class ContainerRow extends Component<ContainerRowProps, ContainerRowState> {
  constructor(props: ContainerRowProps) {
    super(props)
    this.state = {}
  }

  renderGridView() {
    const { container } = this.props
    const status = getContainerStatus(container.State)
    const name = container.Names[0]?.replace(/^\//, '') || 'Unknown'
    const { name: imageName, tag: imageTag } = parseImageName(container.Image)

    // Get network information
    const networks = container.NetworkSettings?.Networks || {}
    const networkNames = Object.keys(networks)
    const primaryNetwork = networkNames[0]
    const containerIP = primaryNetwork ? networks[primaryNetwork]?.IPAddress : null

    // Enhanced port formatting with IP information
    const portsWithDetails = container.Ports.map(port => ({
      ...port,
      displayText: port.PublicPort ?
        `${port.IP || '0.0.0.0'}:${port.PublicPort}→${port.PrivatePort}/${port.Type}` :
        `${port.PrivatePort}/${port.Type}`,
      isPublic: !!port.PublicPort,
      hostIP: port.IP || '0.0.0.0'
    }))

    // Calculate container age
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

    const tagClasses = cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      imageTag === 'latest'
        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
        : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
    )

    const sectionClasses = cn("space-y-2")
    const labelClasses = cn("text-xs font-medium text-gray-700 dark:text-gray-300", "uppercase tracking-wide")
    const valueClasses = cn("text-sm text-gray-900 dark:text-white")

    return (
      <div className={cardClasses}>
        {/* Header with name and status */}
        <div className={headerClasses}>
          <div className="flex-1 min-w-0">
            <div
              className={nameClasses}
              title={`Container Name: ${name}\nFull Names: ${container.Names.join(', ')}`}
            >
              {name}
            </div>
            <div
              className={idClasses}
              title={`Full Container ID: ${container.Id}\nShort ID: ${container.Id.substring(0, 12)}`}
            >
              {container.Id.substring(0, 12)}
            </div>
          </div>
          <div
            className={statusClasses}
            title={`Container Status: ${container.State}\nDetailed Status: ${container.Status}`}
          >
            {status.icon}
            <span className="text-sm font-medium">{status.text}</span>
          </div>
        </div>

        {/* Image and Version */}
        <div className={sectionClasses}>
          <div className={labelClasses}>Image</div>
          <div className="flex items-center justify-between">
            <span
              className={valueClasses}
              title={`Full Image: ${container.Image}\nImage Name: ${imageName}`}
            >
              {imageName}
            </span>
            <span
              className={tagClasses}
              title={`Image Tag: ${imageTag}\n${imageTag === 'latest' ? 'This is the latest version' : 'This is a specific version'}`}
            >
              {imageTag}
            </span>
          </div>
        </div>

        {/* Container Info & Network */}
        <div className={sectionClasses}>
          <div className={labelClasses}>Container Info</div>
          <div className="space-y-2">
            {/* Basic Info */}
            <div className="text-xs">
              <div title={`Container was created ${ageInDays} days ago\nCreated: ${createdDate.toLocaleString()}`}>
                Created: <span className="font-medium text-gray-600 dark:text-gray-400">
                  {ageInDays === 0 ? 'Today' : `${ageInDays} days ago`}
                </span>
              </div>
            </div>

            {/* Network Info */}
            {(containerIP || portsWithDetails.length > 0) && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                {/* Container IP */}
                {containerIP && (
                  <div className="flex items-center space-x-2 text-xs mb-2">
                    <span className="text-gray-600 dark:text-gray-400">IpP:</span>
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

                {/* Ports - Compact Display */}
                {portsWithDetails.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Ports:</div>
                    <div className="flex flex-wrap gap-1">
                      {portsWithDetails.map((port, index) => (
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
            )}
          </div>
        </div>

        {/* Resources */}
        <div className={sectionClasses}>
          <div className={labelClasses}>Resources</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div title={container.State === 'running' ?
              `CPU Usage: ${container?.cpuUsage || 'Not available'}\nReal-time CPU consumption` :
              'CPU usage only available when container is running'
            }>
              CPU: <span className={cn(
                "font-medium",
                container.State === 'running'
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400"
              )}>
                {container.State === 'running' ? (container?.cpuUsage || '~') : '-'}
              </span>
            </div>
            <div title={container.State === 'running' ?
              `Memory Usage: ${container?.memUsage || 'Not available'}\nReal-time memory consumption` :
              'Memory usage only available when container is running'
            }>
              MEM: <span className={cn(
                "font-medium",
                container.State === 'running'
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-400"
              )}>
                {container.State === 'running' ? (container?.memUsage || '~') : '-'}
              </span>
            </div>
          </div>
        </div>



        {/* Footer with uptime and actions */}
        <div className={cn(
          "flex items-center justify-between",
          "pt-3 border-t border-gray-100 dark:border-gray-700"
        )}>
          <div
            className="text-xs text-gray-500 dark:text-gray-400"
            title={`Container uptime since last start\nCreated: ${createdDate.toLocaleString()}\nRunning for: ${formatUptime(container.Created)}`}
          >
            <span className="font-medium">Uptime:</span> {formatUptime(container.Created)}
          </div>
          <ContainerActions
            containerId={container.Id}
            containerName={name}
            containerImage={container.Image}
            containerState={container.State}
            onShowLogs={this.props.onShowLogs}
          />
        </div>
      </div>
    )
  }

  renderListView() {
    const { container } = this.props
    const status = getContainerStatus(container.State)
    const name = container.Names[0]?.replace(/^\//, '') || 'Unknown'
    const { name: imageName, tag: imageTag } = parseImageName(container.Image)

    // Get network information
    const networks = container.NetworkSettings?.Networks || {}
    const networkNames = Object.keys(networks)
    const primaryNetwork = networkNames[0]
    const containerIP = primaryNetwork ? networks[primaryNetwork]?.IPAddress : null

    // Enhanced port formatting for list view
    const publicPorts = container.Ports.filter(port => port.PublicPort)
    const internalPorts = container.Ports.filter(port => !port.PublicPort)

    // Calculate container age
    const createdDate = new Date(container.Created * 1000)
    const now = new Date()
    const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

    const cardClasses = cn(
      "bg-white dark:bg-gray-800",
      "rounded-lg shadow-sm",
      "border border-gray-200 dark:border-gray-700",
      "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
      "transition-all duration-200",
      "p-4"
    )

    const gridClasses = cn(
      "grid gap-3 items-start",
      "grid-cols-1", // Stack on small screens
      "md:grid-cols-[2fr_1fr_1fr_2fr_auto]", // Name, Image, Resources, Network, Actions
      "lg:grid-cols-[2fr_1fr_auto_2fr_auto]" // More space for network on large screens
    )

    const tagClasses = cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      imageTag === 'latest'
        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
        : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
    )

    return (
      <div className={cardClasses}>
        <div className={gridClasses}>
          {/* Container Name & Status */}
          <div className="min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div
                className={cn("flex items-center space-x-2", status.color)}
                title={`Container Status: ${container.State}\nDetailed Status: ${container.Status}`}
              >
                {status.icon}
                <span className="text-sm font-medium">{status.text}</span>
              </div>
            </div>
            <div>
              <div
                className="text-sm font-semibold text-gray-900 dark:text-white truncate"
                title={`Container Name: ${name}\nFull Names: ${container.Names.join(', ')}`}
              >
                {name}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span
                  className="font-mono"
                  title={`Full Container ID: ${container.Id}`}
                >
                  {container.Id.substring(0, 12)}
                </span>
                <span
                  className="text-gray-400"
                  title={`Container was created ${ageInDays} days ago\nCreated: ${createdDate.toLocaleString()}`}
                >
                  • {ageInDays === 0 ? 'Today' : `${ageInDays}d`}
                </span>
              </div>
            </div>
          </div>

          {/* Image & Version */}
          <div className="min-w-0">
            <div
              className="text-sm text-gray-900 dark:text-white truncate"
              title={`Full Image: ${container.Image}\nImage Name: ${imageName}`}
            >
              {imageName}
            </div>
            <div className="mt-1">
              <span
                className={tagClasses}
                title={`Image Tag: ${imageTag}\n${imageTag === 'latest' ? 'This is the latest version' : 'This is a specific version'}`}
              >
                {imageTag}
              </span>
            </div>
          </div>

          {/* Resources */}
          <div className="text-xs space-y-1">
            <div title={container.State === 'running' ?
              `CPU Usage: ${container?.cpuUsage || 'Not available'}\nReal-time CPU consumption` :
              'CPU usage only available when container is running'
            }>
              CPU: <span className={cn(
                "font-medium",
                container.State === 'running'
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400"
              )}>
                {container.State === 'running' ? (container?.cpuUsage || '~') : '-'}
              </span>
            </div>
            <div title={container.State === 'running' ?
              `Memory Usage: ${container?.memUsage || 'Not available'}\nReal-time memory consumption` :
              'Memory usage only available when container is running'
            }>
              MEM: <span className={cn(
                "font-medium",
                container.State === 'running'
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-400"
              )}>
                {container.State === 'running' ? (container?.memUsage || '~') : '-'}
              </span>
            </div>
          </div>

          {/* Network & Connectivity - Separate Column */}
          <div className="text-xs space-y-2 min-w-0">
            {/* Container IP */}
            {containerIP && (
              <div
                className="flex items-center space-x-1"
                title={`Container IP: ${containerIP}\nNetwork: ${primaryNetwork || 'default'}`}
              >
                <span className="text-gray-500 dark:text-gray-400 font-medium">IP:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {containerIP}
                </span>
              </div>
            )}

            {/* All Ports - No Ellipsis on Large Screens */}
            {container.Ports.length > 0 && (
              <div className="space-y-1">
                {publicPorts.length > 0 && (
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">Public Ports:</div>
                    <div className="flex flex-wrap gap-1">
                      {publicPorts.map((port, index) => (
                        <span
                          key={`pub-${index}`}
                          className="inline-flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded font-mono"
                          title={`Public port: ${port.IP || '0.0.0.0'}:${port.PublicPort} → ${port.PrivatePort}/${port.Type}`}
                        >
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          <span>{port.IP || '0.0.0.0'}:{port.PublicPort}→{port.PrivatePort}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {internalPorts.length > 0 && (
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">Internal Ports:</div>
                    <div className="flex flex-wrap gap-1">
                      {internalPorts.map((port, index) => (
                        <span
                          key={`int-${index}`}
                          className="inline-flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded font-mono"
                          title={`Internal port: ${port.PrivatePort}/${port.Type}`}
                        >
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          <span>{port.PrivatePort}/{port.Type}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {container.Ports.length === 0 && (
              <span
                className="text-gray-400 italic"
                title="No network ports configured"
              >
                No network ports
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <ContainerActions
              containerId={container.Id}
              containerName={name}
              containerImage={container.Image}
              containerState={container.State}
              onShowLogs={this.props.onShowLogs}
            />
          </div>
        </div>

        {/* Status and uptime info */}
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div
              className="italic"
              title={`Full Status: ${container.Status}`}
            >
              {container.Status}
            </div>
            <div
              className="font-medium"
              title={`Container uptime since last start\nCreated: ${createdDate.toLocaleString()}\nRunning for: ${formatUptime(container.Created)}`}
            >
              Uptime: {formatUptime(container.Created)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { viewMode = 'grid' } = this.props
    return viewMode === 'grid' ? this.renderGridView() : this.renderListView()
  }
}