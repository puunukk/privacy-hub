import { Component } from 'react'
import type { DockerContainer } from '../types/docker'
import { getContainerStatus } from '../utils/containerStatus'
import { formatUptime, parseImageName } from '../utils/docker'
import { ContainerActions } from './ContainerActions'

interface ContainerRowProps {
  container: DockerContainer
}

interface ContainerRowState {}

export class ContainerRow extends Component<ContainerRowProps, ContainerRowState> {
  constructor(props: ContainerRowProps) {
    super(props)
    this.state = {}
  }

  render() {
    const { container } = this.props
    
    const status = getContainerStatus(container.State)
    const name = container.Names[0]?.replace(/^\//, '') || 'Unknown'
    const { name: imageName, tag: imageTag } = parseImageName(container.Image)

    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="container-icon w-6 h-6"></div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {container.Id.substring(0, 12)}
              </div>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`flex items-center space-x-2 ${status.color}`}>
            {status.icon}
            <span className="text-sm font-medium">{status.text}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">{container.Status}</div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white">{imageName}</div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            imageTag === 'latest' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {imageTag}
          </span>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-xs text-gray-500">
            {container.State === 'running' ? (
              <>
                <div>CPU: <span className="text-gray-400">-</span></div>
                <div>MEM: <span className="text-gray-400">-</span></div>
              </>
            ) : (
              <>
                <div>CPU: <span className="text-gray-400">-</span></div>
                <div>MEM: <span className="text-gray-400">-</span></div>
              </>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="space-y-1">
            {container.Ports.length > 0 ? (
              container.Ports.map((port, index) => (
                <div key={index} className="text-xs text-gray-600">
                  {port.PublicPort ? `${port.PublicPort}:` : ''}
                  {port.PrivatePort}/{port.Type}
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400">None</span>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatUptime(container.Created)}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <ContainerActions
            containerId={container.Id}
            containerName={name}
            containerImage={container.Image}
            containerState={container.State}
          />
        </td>
      </tr>
    )
  }
}