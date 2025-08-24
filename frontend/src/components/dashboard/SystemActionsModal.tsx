import { Component } from 'react'
import { X, RotateCcw, Power, Zap, Terminal, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SystemActionsModalProps {
  isOpen: boolean
  onClose: () => void
  hostname?: string
}

interface SystemActionsModalState {
  showAdvanced: boolean
  isExecuting: boolean
  executingAction: string | null
}

export class SystemActionsModal extends Component<SystemActionsModalProps, SystemActionsModalState> {
  constructor(props: SystemActionsModalProps) {
    super(props)
    this.state = {
      showAdvanced: false,
      isExecuting: false,
      executingAction: null
    }
  }

  toggleAdvanced = () => {
    this.setState(prev => ({ showAdvanced: !prev.showAdvanced }))
  }

  executeAction = async (action: string, endpoint: string) => {
    this.setState({ isExecuting: true, executingAction: action })
    
    try {
      const response = await fetch(endpoint, { method: 'POST' })
      const result = await response.json()
      
      if (result.status === 'success') {
        // Show success message or notification
        console.log(`${action} executed successfully`)
      } else {
        console.error(`${action} failed:`, result.error)
      }
    } catch (error) {
      console.error(`${action} error:`, error)
    } finally {
      this.setState({ isExecuting: false, executingAction: null })
      // Close modal after a delay for user feedback
      setTimeout(() => this.props.onClose(), 1000)
    }
  }

  handleReboot = () => this.executeAction('Reboot', '/pi-system/reboot')
  handleShutdown = () => this.executeAction('Shutdown', '/pi-system/shutdown')
  handleForceShutdown = () => this.executeAction('Force Shutdown', '/pi-system/force-shutdown')
  handleRestart = () => this.executeAction('Restart Services', '/pi-system/restart')

  render() {
    const { isOpen, onClose, hostname } = this.props
    const { showAdvanced, isExecuting, executingAction } = this.state

    if (!isOpen) return null

    const modalClasses = cn(
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    )

    const contentClasses = cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
    )

    const buttonClasses = cn(
      "w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all",
      "disabled:opacity-50 disabled:cursor-not-allowed"
    )

    return (
      <div className={modalClasses} onClick={onClose}>
        <div className={contentClasses} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Pi System Commands
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hostname && `${hostname} • `}Manage your Raspberry Pi
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isExecuting}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {isExecuting && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="text-blue-800 dark:text-blue-200">
                    Executing {executingAction}...
                  </span>
                </div>
              </div>
            )}

            {/* Basic Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                System Control
              </h3>
              
              <button
                onClick={this.handleReboot}
                disabled={isExecuting}
                className={cn(
                  buttonClasses,
                  "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200",
                  "dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                )}
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reboot System</span>
              </button>

              <button
                onClick={this.handleShutdown}
                disabled={isExecuting}
                className={cn(
                  buttonClasses,
                  "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200",
                  "dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                )}
              >
                <Power className="w-5 h-5" />
                <span>Shutdown</span>
              </button>

              <button
                onClick={this.handleRestart}
                disabled={isExecuting}
                className={cn(
                  buttonClasses,
                  "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200",
                  "dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                )}
              >
                <RefreshCw className="w-5 h-5" />
                <span>Restart Services</span>
              </button>
            </div>

            {/* Advanced Actions Toggle */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={this.toggleAdvanced}
                disabled={isExecuting}
                className={cn(
                  "w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm",
                  "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200",
                  "hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                )}
              >
                <Terminal className="w-4 h-4" />
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-3">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      ⚠️ Advanced actions can be dangerous. Use with caution.
                    </p>
                  </div>

                  <button
                    onClick={this.handleForceShutdown}
                    disabled={isExecuting}
                    className={cn(
                      buttonClasses,
                      "bg-red-100 hover:bg-red-200 text-red-800 border border-red-300",
                      "dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-200 dark:border-red-700"
                    )}
                  >
                    <Zap className="w-5 h-5" />
                    <span>Force Shutdown</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <button
              onClick={onClose}
              disabled={isExecuting}
              className={cn(
                "w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
                "rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }
}