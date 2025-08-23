import { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import type { RootState } from '@/store'
import { SystemInfo } from './SystemInfo'

const mapStateToProps = (state: RootState) => ({
  dockerInfo: state.containers.dockerInfo,
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
type ConnectedSystemInfoCardProps = ConnectedProps<typeof connector>

class ConnectedSystemInfoCard extends Component<ConnectedSystemInfoCardProps> {
  render() {
    const { dockerInfo, networkInfo } = this.props
    
    return (
      <SystemInfo 
        dockerInfo={dockerInfo}
        networkInfo={networkInfo}
      />
    )
  }
}

export default connector(ConnectedSystemInfoCard)