import { Play, Square, RotateCcw, Trash2, RefreshCw, Shield } from 'lucide-react'
import type { ContainerAction } from '../types/docker'

interface ContainerActionsProps {
  containerId: string
  containerName: string
  containerImage: string
  containerState: string
  isLoading: boolean
  onAction: (containerId: string, action: ContainerAction) => Promise<void>
}

export const ContainerActions = ({ 
  containerId, 
  containerName, 
  containerImage,
  containerState, 
  isLoading, 
  onAction 
}: ContainerActionsProps) => {
  const isPrivacyTool = containerImage.toLowerCase().includes('searxng') || 
                       containerImage.toLowerCase().includes('pihole')

  return (
    <div className="flex items-center space-x-2">
    {containerState === 'running' ? (
      <>
        <button
          type="button"
          onClick={() => onAction(containerId, 'stop')}
          disabled={isLoading}
          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
          title="Stop"
        >
          <Square className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onAction(containerId, 'restart')}
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
        onClick={() => onAction(containerId, 'start')}
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
        onClick={() => {
          if (window.confirm(`🔐 Privacy Reset: This will rebuild "${containerName}" container, clearing all history and cached data. Continue?`)) {
            onAction(containerId, 'privacy_reset')
          }
        }}
        disabled={isLoading}
        className="p-1 text-purple-600 hover:text-purple-800 disabled:opacity-50"
        title="Privacy Reset - Rebuild container to clear all data"
      >
        <Shield className="h-4 w-4" />
      </button>
    )}
    
    <button
      type="button"
      onClick={() => {
        if (window.confirm(`Are you sure you want to remove container "${containerName}"?`)) {
          onAction(containerId, 'remove')
        }
      }}
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