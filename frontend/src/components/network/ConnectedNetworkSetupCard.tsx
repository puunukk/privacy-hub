import { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import type { RootState } from '@/store'
import { NetworkSetupCard } from './NetworkSetupCard'

const mapStateToProps = (state: RootState) => ({
  networkInfo: state.systemInfo.data ? {
    hostname: state.systemInfo.data.hostname,
    hostIP: state.systemInfo.data.ip,
    gateway: state.systemInfo.data.gateway,
    dnsServers: [state.systemInfo.data.dns],
    subnet: state.systemInfo.data.ip, // simplified
    isDhcpClient: true, // default assumption
    macAddress: undefined
  } : null,
})

const connector = connect(mapStateToProps)
type ConnectedNetworkSetupCardProps = ConnectedProps<typeof connector>

class ConnectedNetworkSetupCard extends Component<ConnectedNetworkSetupCardProps> {
  render() {
    const { networkInfo } = this.props
    
    if (!networkInfo) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            Loading network information...
          </div>
        </div>
      )
    }
    
    return <NetworkSetupCard networkInfo={networkInfo} />
  }
}

export default connector(ConnectedNetworkSetupCard)