import { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from '@reduxjs/toolkit'
import { Play, Square, RotateCcw, Trash2, RefreshCw, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ContainerActionTypes } from '@/sagas/docker/types'
import type { ContainerAction } from '@/types/docker'
import type { RootState } from '@/store'

interface ContainerActionsProps {
  containerId: string
  containerName: string
  containerImage: string
  containerState: string
  onShowLogs?: (containerId: string, containerName: string) => void
  // Redux props
  actionLoadingContainerId: string | null
  dispatch: Dispatch
}

interface ContainerActionsState { }

class ContainerActions extends Component<ContainerActionsProps, ContainerActionsState> {
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
      <div className="flex items-center space-x-1">
        {containerState === 'running' ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => this.handleAction('stop')}
              disabled={isLoading}
              title="Stop"
              className="!p-1 !text-red-600 hover:!text-red-800 hover:!bg-red-50 dark:hover:!bg-red-900/20"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => this.handleAction('restart')}
              disabled={isLoading}
              title="Restart"
              className="!p-1 !text-yellow-600 hover:!text-yellow-800 hover:!bg-yellow-50 dark:hover:!bg-yellow-900/20"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => this.handleAction('start')}
            disabled={isLoading}
            title="Start"
            className="!p-1 !text-green-600 hover:!text-green-800 hover:!bg-green-50 dark:hover:!bg-green-900/20"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}

        {/* Privacy Reset - for privacy tools like SearXNG */}
        {isPrivacyTool && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => this.handleAction('privacy_reset')}
            disabled={isLoading}
            title="Privacy Reset - Rebuild container to clear all data"
            className="!p-1 !text-purple-600 hover:!text-purple-800 hover:!bg-purple-50 dark:hover:!bg-purple-900/20"
          >
            <Shield className="h-4 w-4" />
          </Button>
        )}

        {/* Logs button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => this.props.onShowLogs?.(this.props.containerId, this.props.containerName)}
          disabled={isLoading}
          title="View Logs"
          className="!p-1 !text-blue-600 hover:!text-blue-800 hover:!bg-blue-50 dark:hover:!bg-blue-900/20"
        >
          <FileText className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => this.handleAction('remove')}
          disabled={isLoading || containerState === 'running'}
          title="Remove (container must be stopped)"
          className="!p-1 !text-red-600 hover:!text-red-800 hover:!bg-red-50 dark:hover:!bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {isLoading && (
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
        )}
      </div>
    )
  }
}

// Redux connection - only map what this component needs
const mapStateToProps = (state: RootState) => ({
  actionLoadingContainerId: state.containers.actionLoadingContainerId
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
})

export default connect(mapStateToProps, mapDispatchToProps)(ContainerActions)