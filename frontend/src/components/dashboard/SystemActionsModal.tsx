import { Component } from 'react'
import { connect } from 'react-redux'
import { RotateCcw, Power, Zap, Terminal, RefreshCw } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'
import { SystemActionTypes, SystemCommands } from '@/sagas/system/types'
import { Dispatch } from 'redux'
import { RootState } from '@/store'

interface SystemActionsModalOwnProps {
  isOpen: boolean
  onClose: () => void
  hostname?: string
}

interface SystemActionsModalProps extends SystemActionsModalOwnProps {
  dispatch: Dispatch
  runCmd: (command: SystemCommands) => void
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

  dispatchSystemCommand = (command: SystemCommands, actionName: string) => {
    //const { dispatch, runCmd } = this.props
    this.setState({ isExecuting: true, executingAction: actionName })

    this.props.runCmd(command)

    // Auto-close modal after dispatching (sagas handle notifications)
    setTimeout(() => {
      this.setState({ isExecuting: false, executingAction: null })
      this.props.onClose()
    }, 1500)
  }

  handleReboot = () => this.dispatchSystemCommand(SystemCommands.REBOOT, 'Reboot')
  handleForceReboot = () => this.dispatchSystemCommand(SystemCommands.FORCE_REBOOT, 'Force Reboot')
  handleShutdown = () => this.dispatchSystemCommand(SystemCommands.SHUTDOWN, 'Shutdown')
  handleForceShutdown = () => this.dispatchSystemCommand(SystemCommands.FORCE_SHUTDOWN, 'Force Shutdown')
  handleRestart = () => this.dispatchSystemCommand(SystemCommands.RESTART_SERVICES, 'Restart Services')

  render() {
    const { isOpen, onClose, hostname } = this.props
    const { showAdvanced, isExecuting, executingAction } = this.state

    const buttonClasses = cn(
      "w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all",
      "disabled:opacity-50 disabled:cursor-not-allowed"
    )

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Pi System Commands"
        size="md"
      >
        <div className="space-y-6">
          <Typography.Text color="muted" size="sm">
            {hostname && `${hostname} • `}Manage your Raspberry Pi
          </Typography.Text>

          {isExecuting && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <Typography.Text color="info">
                  Executing {executingAction}...
                </Typography.Text>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Typography.Title level={6} color="secondary" className="uppercase tracking-wider">
              System Control
            </Typography.Title>

            <div className="space-y-3">
              <Button
                onClick={this.handleRestart}
                disabled={isExecuting}
                variant="secondary"
                className={cn(
                  buttonClasses,
                  "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200",
                  "dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                )}
              >
                <RefreshCw className="w-5 h-5" />
                <Typography.Text>Restart Services</Typography.Text>
              </Button>

              <Button
                onClick={this.handleReboot}
                disabled={isExecuting}
                variant="secondary"
                className={cn(
                  buttonClasses,
                  "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200",
                  "dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                )}
              >
                <RotateCcw className="w-5 h-5" />
                <Typography.Text>Reboot System</Typography.Text>
              </Button>

              <Button
                onClick={this.handleForceReboot}
                disabled={isExecuting}
                variant="secondary"
                className={cn(
                  buttonClasses,
                  "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200",
                  "dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                )}
              >
                <RotateCcw className="w-5 h-5" />
                <Typography.Text>Force Reboot System</Typography.Text>
              </Button>

              <Button
                onClick={this.handleShutdown}
                disabled={isExecuting}
                variant="danger"
                className={cn(
                  buttonClasses,
                  "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200",
                  "dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                )}
              >
                <Power className="w-5 h-5" />
                <Typography.Text>Shutdown</Typography.Text>
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              onClick={this.toggleAdvanced}
              disabled={isExecuting}
              variant="ghost"
              className="w-full flex items-center justify-center space-x-2"
            >
              <Terminal className="w-4 h-4" />
              <Typography.Text>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</Typography.Text>
            </Button>

            {showAdvanced && (
              <div className="mt-4 space-y-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <Typography.Text color="warning" size="xs">
                    ⚠️ Advanced actions can be dangerous. Use with caution.
                  </Typography.Text>
                </div>

                <Button
                  onClick={this.handleForceShutdown}
                  disabled={isExecuting}
                  variant="danger"
                  className={cn(
                    buttonClasses,
                    "bg-red-100 hover:bg-red-200 text-red-800 border border-red-300",
                    "dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-200 dark:border-red-700"
                  )}
                >
                  <Zap className="w-5 h-5" />
                  <Typography.Text>Force Shutdown</Typography.Text>
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 bg-gray-50 dark:bg-gray-700/50 -m-4 mt-6 p-4">
            <Button
              onClick={onClose}
              disabled={isExecuting}
              variant="secondary"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = (_state: RootState) => ({})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  runCmd: (command: SystemCommands) => dispatch({
    type: SystemActionTypes.EXECUTE_SYSTEM_COMMAND,
    payload: { command }
  }),
  dispatch
})

const connector = connect(mapStateToProps, mapDispatchToProps)
export type ConnectedSystemActionsModal = typeof connector
export default connector(SystemActionsModal)