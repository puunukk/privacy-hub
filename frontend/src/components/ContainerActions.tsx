import { Component } from 'react'
import { Play, Square, RotateCcw, Trash2, RefreshCw, Shield } from 'lucide-react'
import { withContainerRedux } from '../store/hoc/withRedux'
import type { ContainerReduxProps } from '../store/hoc/withRedux'
import { ContainerActionTypes } from '../store/actions/types'
import type { ContainerAction } from '../types/docker'

interface ContainerActionsProps extends ContainerReduxProps {
  containerId: string
  containerName: string
  containerImage: string
  containerState: string
}

interface ContainerActionsState {}

class ContainerActionsBase extends Component<ContainerActionsProps, ContainerActionsState> {
  constructor(props: ContainerActionsProps) {
    super(props)
    this.state = {}
  }

  private handleAction = (action: ContainerAction) => {
    const { containerId, containerName, dispatch } = this.props

    if (action === 'privacy_reset') {
      if (window.confirm(`🔐 Privacy Reset: This will rebuild "${containerName}" container, clearing all history and cached data. Continue?`)) {
        dispatch({
          type: ContainerActionTypes.EXECUTE_CONTAINER_ACTION_REQUEST,
          payload: { containerId, action, containerName }
        })
      }
      return
    }

    if (action === 'remove') {
      if (window.confirm(`Are you sure you want to remove container "${containerName}"?`)) {
        dispatch({
          type: ContainerActionTypes.EXECUTE_CONTAINER_ACTION_REQUEST,
          payload: { containerId, action, containerName }
        })
      }
      return
    }

    dispatch({
      type: ContainerActionTypes.EXECUTE_CONTAINER_ACTION_REQUEST,
      payload: { containerId, action, containerName }
    })
  }

  render() {
    const { containerId, containerImage, containerState, actionLoadingContainerId } = this.props
    const isLoading = actionLoadingContainerId === containerId

    const isPrivacyTool = containerImage.toLowerCase().includes('searxng') || 
                         containerImage.toLowerCase().includes('pihole')

    return (
      <div className="flex items-center space-x-2">
        {containerState === 'running' ? (
          <>
            <button
              type="button"
              onClick={() => this.handleAction('stop')}
              disabled={isLoading}
              className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
              title="Stop"
            >
              <Square className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => this.handleAction('restart')}
              disabled={isLoading}
              className="p-1 text-yellow-600 hover:text-yellow-800 disabled:opacity-50"
              title="Restart"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => this.handleAction('start')}
            disabled={isLoading}
            className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
            title="Start"
          >
            <Play className="h-4 w-4" />
          </button>
        )}
        
        {/* Privacy Reset - for privacy tools like SearXNG */}
        {isPrivacyTool && (
          <button
            type="button"
            onClick={() => this.handleAction('privacy_reset')}
            disabled={isLoading}
            className="p-1 text-purple-600 hover:text-purple-800 disabled:opacity-50"
            title="Privacy Reset - Rebuild container to clear all data"
          >
            <Shield className="h-4 w-4" />
          </button>
        )}
        
        <button
          type="button"
          onClick={() => this.handleAction('remove')}
          disabled={isLoading || containerState === 'running'}
          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
          title="Remove (container must be stopped)"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        
        {isLoading && (
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
        )}
      </div>
    )
  }
}

export const ContainerActions = withContainerRedux(ContainerActionsBase)