import { Component } from 'react'
import { connect } from 'react-redux'
import type { RootState } from '../store/store'

interface DebugInfoProps {
  reduxState: RootState
}

class DebugInfoBase extends Component<DebugInfoProps> {
  render() {
    const { reduxState } = this.props

    // Only show in development
    if (process.env.NODE_ENV === 'production') {
      return null
    }

    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto'
      }}>
        <div><strong>Redux Debug Info:</strong></div>
        <div>State exists: {reduxState ? 'YES' : 'NO'}</div>
        {reduxState && (
          <>
            <div>Containers: {reduxState.containers ? 'EXISTS' : 'NULL'}</div>
            <div>Containers array: {Array.isArray(reduxState.containers?.containers) ? `[${reduxState.containers.containers.length}]` : 'NOT ARRAY'}</div>
            <div>System: {reduxState.system ? 'EXISTS' : 'NULL'}</div>
            <div>Network: {reduxState.network ? 'EXISTS' : 'NULL'}</div>
            <div>Initialized: {reduxState.system?.isInitialized ? 'YES' : 'NO'}</div>
          </>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  reduxState: state
})

export const DebugInfo = connect(mapStateToProps)(DebugInfoBase)
