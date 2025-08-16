import { PureComponent, ReactNode } from 'react'
import { X, AlertTriangle, Info, RotateCcw, Power, Zap } from 'lucide-react'
import { Button } from './Button'
import { Typography } from './Typography'
import { cn } from '../../utils/cn'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg'
}

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
    isLoading?: boolean
}

const modalSizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
}

const modalWrapperClasses = cn(
    'fixed inset-0 z-50 overflow-y-auto'
)

const modalBackdropClasses = cn(
    'fixed inset-0',
    'bg-black/20 dark:bg-white/20 backdrop-blur-md transition-opacity'
)

const modalContainerClasses = cn(
    'flex min-h-full items-center justify-center p-4'
)

const modalContentClasses = cn(
    'relative w-full',
    'bg-white dark:bg-gray-800',
    'rounded-lg shadow-xl',
    'transform transition-all'
)

const modalHeaderClasses = cn(
    'flex items-center justify-between p-4',
    'border-b border-gray-200 dark:border-gray-700'
)

const modalBodyClasses = cn(
    'p-4'
)

export class Modal extends PureComponent<ModalProps> {
    render() {
        const { isOpen, onClose, title, children, size = 'md' } = this.props

        if (!isOpen) return null

        return (
            <div className={modalWrapperClasses}>
                <div className={modalBackdropClasses} onClick={onClose} />

                <div className={modalContainerClasses}>
                    <div className={cn(modalContentClasses, modalSizes[size])}>
                        <div className={modalHeaderClasses}>
                            <Typography.Title level={4} color="primary">
                                {title}
                            </Typography.Title>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="!p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className={modalBodyClasses}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export class ConfirmationModal extends PureComponent<ConfirmationModalProps> {
    private getVariantIcon = () => {
        const { variant = 'info' } = this.props
        switch (variant) {
            case 'danger':
                return <AlertTriangle className="h-6 w-6" />
            case 'warning':
                return <AlertTriangle className="h-6 w-6" />
            default:
                return <Info className="h-6 w-6" />
        }
    }

    private getVariantButtonType = () => {
        const { variant = 'info' } = this.props
        switch (variant) {
            case 'danger':
                return 'danger'
            case 'warning':
                return 'warning'
            default:
                return 'primary'
        }
    }

    private getVariantColor = () => {
        const { variant = 'info' } = this.props
        switch (variant) {
            case 'danger':
                return 'danger'
            case 'warning':
                return 'warning'
            default:
                return 'info'
        }
    }

    render() {
        const {
            isOpen,
            onClose,
            onConfirm,
            title,
            message,
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            isLoading = false
        } = this.props

        const contentClasses = cn('space-y-4')
        const iconRowClasses = cn('flex items-start space-x-3')
        const iconClasses = cn('flex-shrink-0')
        const actionsClasses = cn('flex justify-end space-x-3 pt-4')

        return (
            <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
                <div className={contentClasses}>
                    <div className={iconRowClasses}>
                        <div className={iconClasses}>
                            <Typography.Text color={this.getVariantColor()}>
                                {this.getVariantIcon()}
                            </Typography.Text>
                        </div>
                        <div>
                            <Typography.Title level={5} color={this.getVariantColor()}>
                                {title}
                            </Typography.Title>
                            <Typography.Text size="sm" color="muted" className="mt-1">
                                {message}
                            </Typography.Text>
                        </div>
                    </div>

                    <div className={actionsClasses}>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={this.getVariantButtonType() as any}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : confirmText}
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }
}

// System Actions Modal - Contains action buttons inside
interface SystemActionsModalProps {
    isOpen: boolean
    onClose: () => void
    onShutdown: () => void
    onReboot: () => void
    onForceShutdown: () => void
    isLoading?: boolean
}

export class SystemActionsModal extends PureComponent<SystemActionsModalProps> {
    render() {
        const {
            isOpen,
            onClose,
            onShutdown,
            onReboot,
            onForceShutdown,
            isLoading = false
        } = this.props

        const contentClasses = cn('space-y-4')
        const buttonsClasses = cn('space-y-3')
        const buttonContentClasses = cn('flex items-center space-x-3')
        const buttonTextClasses = cn('text-left', 'flex flex-col')
        const actionsClasses = cn('flex justify-end pt-4')

        return (
            <Modal isOpen={isOpen} onClose={onClose} title="System Actions" size="sm">
                <div className={contentClasses}>
                    <Typography.Paragraph size="sm" color="muted">
                        Choose a system action. These operations will affect the entire system.
                    </Typography.Paragraph>

                    <div className={buttonsClasses}>
                        <Button
                            variant="ghost"
                            onClick={onReboot}
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
                            onClick={onShutdown}
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
                            onClick={onForceShutdown}
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
