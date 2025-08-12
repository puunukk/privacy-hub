import { Component } from 'react'
import { Server } from 'lucide-react'
import { ContainerRow } from './ContainerRow'
import { withContainerRedux } from '../store/hoc/withRedux'
import type { ContainerConnectedProps } from '../store/hoc/withRedux'

interface ContainersTableProps {}

interface ContainersTableState {}

class ContainersTableBase extends Component<ContainersTableProps & ContainerConnectedProps, ContainersTableState> {
  constructor(props: ContainersTableProps & ContainerConnectedProps) {
    super(props)
    this.state = {}
  }

  render() {
    const { containers } = this.props
    const runningCount = containers.filter(c => c.State === 'running').length
    const totalCount = containers.length
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Containers ({runningCount}/{totalCount} running)
          </h2>
        </div>
      
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Container
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Resources
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ports
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {containers.map((container) => (
                <ContainerRow
                  key={container.Id}
                  container={container}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {containers.length === 0 && (
          <div className="text-center py-12">
            <Server className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No containers found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No Docker containers are currently available.
            </p>
          </div>
        )}
      </div>
    )
  }
}

export const ContainersTable = withContainerRedux(ContainersTableBase)