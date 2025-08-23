import { Dispatch } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import { PureComponent } from 'react'
import { RotateCcw, Power, Zap } from 'lucide-react'

import { cn } from '@/utils/cn'
import { Modal } from '@/components/ui/Modal'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { RootState } from '@/store'

const mapStateToProps = (_state: RootState) => ({
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
    //onClose: () => dispatch({ type: 'SYSTEM_ACTIONS_MODAL_CLOSE' }),
    onShutdown: () => dispatch({ type: 'SYSTEM_SHUTDOWN_REQUEST' }),
    onReboot: () => dispatch({ type: 'SYSTEM_REBOOT_REQUEST' }),
    onForceShutdown: () => dispatch({ type: 'SYSTEM_FORCE_SHUTDOWN_REQUEST' }),
})


// System Actions Modal - Contains action buttons inside
interface SystemActionsModalOwnProps {
    isOpen: boolean
    onClose: () => void
    isLoading?: boolean
}

type SystemActionsModalProps = SystemActionsModalOwnProps & {
    onShutdown: () => void
    onReboot: () => void
    onForceShutdown: () => void
}

interface SystemActionsModalState {
    showAdvancedControls: boolean
}

class SystemActionsModal extends PureComponent<SystemActionsModalProps, SystemActionsModalState> {
    state = {
        showAdvancedControls: false,
    }

    toggleAdvancedControls() {
        this.setState(prevState => ({
            showAdvancedControls: !prevState.showAdvancedControls
        }));
    }

    handleReboot = () => {
        this.props.onReboot()
    }

    handleShutdown = () => {
        this.props.onShutdown()
    }

    handleForceShutdown = () => {
        this.props.onForceShutdown()
    }

    render() {
        const {
            isOpen,
            onClose,
            isLoading = false
        } = this.props

        const contentClasses = cn('space-y-4')
        const buttonsClasses = cn('space-y-3')
        const buttonContentClasses = cn('flex items-center space-x-3')
        const buttonTextClasses = cn('text-left', 'flex flex-col')
        const actionsClasses = cn('flex justify-end pt-4')

        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="System Actions"
                size="sm"
            >
                <div className={contentClasses}>
                    <Typography.Paragraph size="sm" color="muted">
                        Choose a system action. These operations will affect the entire system.
                    </Typography.Paragraph>

                    <div className={buttonsClasses}>
                        <Button
                            variant="ghost"
                            onClick={this.handleReboot}
                            disabled={isLoading}
                            className={cn(
                                "w-full justify-start p-4 h-auto",
                                "border border-orange-200 dark:border-orange-800",
                                "hover:border-orange-300 dark:hover:border-orange-700",
                                "hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            )}
                        >
                            <div className={buttonContentClasses}>
                                <RotateCcw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                <div className={buttonTextClasses}>
                                    <Typography.Text size="base" weight="medium" color="primary">
                                        Reboot System
                                    </Typography.Text>
                                    <Typography.Text size="xs" color="muted">
                                        Restart the entire system gracefully
                                    </Typography.Text>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={this.handleShutdown}
                            disabled={isLoading}
                            className={cn(
                                "w-full justify-start p-4 h-auto",
                                "border border-red-200 dark:border-red-800",
                                "hover:border-red-300 dark:hover:border-red-700",
                                "hover:bg-red-50 dark:hover:bg-red-900/20"
                            )}
                        >
                            <div className={buttonContentClasses}>
                                <Power className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <div className={buttonTextClasses}>
                                    <Typography.Text size="base" weight="medium" color="primary">
                                        Shutdown System
                                    </Typography.Text>
                                    <Typography.Text size="xs" color="muted">
                                        Power off the system gracefully
                                    </Typography.Text>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={this.handleForceShutdown}
                            disabled={isLoading}
                            className={cn(
                                "w-full justify-start p-4 h-auto",
                                "border border-red-300 dark:border-red-700",
                                "hover:border-red-400 dark:hover:border-red-600",
                                "hover:bg-red-100 dark:hover:bg-red-900/30"
                            )}
                        >
                            <div className={buttonContentClasses}>
                                <Zap className="h-5 w-5 text-red-700 dark:text-red-300" />
                                <div className={buttonTextClasses}>
                                    <Typography.Text size="base" weight="medium" color="danger">
                                        Force Shutdown
                                    </Typography.Text>
                                    <Typography.Text size="xs" color="muted">
                                        use only if normal shutdown fails
                                    </Typography.Text>
                                </div>
                            </div>
                        </Button>
                    </div>

                    <Button
                        onClick={this.toggleAdvancedControls}
                        className="toggle-advanced-button"
                    >
                        {this.state.showAdvancedControls ? 'Hide' : 'Show'} Advanced Controls
                    </Button>
                    <div className={actionsClasses}>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }
}

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(SystemActionsModal)