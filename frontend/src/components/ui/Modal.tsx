import { ReactNode, Component } from 'react'
import { X, AlertTriangle, Info } from 'lucide-react'
import { Button } from './Button'
import { Typography } from './Typography'
import { cn } from '@/utils/cn'

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
    'fixed inset-0 z-50 overflow-y-auto',
    'animate-fade-in'
)

const modalBackdropClasses = cn(
    'fixed inset-0',
    'bg-black/30 dark:bg-black/50 backdrop-blur-sm transition-all duration-300'
)

const modalContainerClasses = cn(
    'flex min-h-full items-center justify-center p-4'
)

const modalContentClasses = cn(
    'relative w-full',
    'bg-white dark:bg-gray-800',
    'rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700',
    'transform transition-all duration-300',
    'animate-scale-in'
)

const modalHeaderClasses = cn(
    'flex items-center justify-between p-4',
    'border-b border-gray-200 dark:border-gray-700'
)

const modalBodyClasses = cn(
    'p-4'
)

export class Modal extends Component<ModalProps> {
  componentDidMount() {
    if (this.props.isOpen) {
      document.addEventListener('keydown', this.handleEscape);
      document.body.style.overflow = 'hidden';
    }
  }

  componentDidUpdate(prevProps: ModalProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      document.addEventListener('keydown', this.handleEscape);
      document.body.style.overflow = 'hidden';
    } else if (!this.props.isOpen && prevProps.isOpen) {
      document.removeEventListener('keydown', this.handleEscape);
      document.body.style.overflow = 'unset';
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleEscape);
    document.body.style.overflow = 'unset';
  }

  handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.props.onClose();
    }
  }

  render() {
    const { isOpen, onClose, title, children, size = 'md' } = this.props;

    if (!isOpen) return null;

    return (
      <div className={modalWrapperClasses}>
        <div 
          className={modalBackdropClasses} 
          onClick={onClose}
          aria-hidden="true"
        />

        <div className={modalContainerClasses}>
          <div 
            className={cn(modalContentClasses, modalSizes[size])}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className={modalHeaderClasses}>
              <Typography.Title level={4} color="primary" className="pr-8">
                {title}
              </Typography.Title>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 !p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className={modalBodyClasses}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const getVariantIcon = (variant: ConfirmationModalProps['variant'] = 'info') => {
  switch (variant) {
    case 'danger':
      return <AlertTriangle className="h-6 w-6" />
    case 'warning':
      return <AlertTriangle className="h-6 w-6" />
    default:
      return <Info className="h-6 w-6" />
  }
}

const getVariantButtonType = (variant: ConfirmationModalProps['variant'] = 'info') => {
  switch (variant) {
    case 'danger':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return 'primary'
  }
}

const getVariantColor = (variant: ConfirmationModalProps['variant'] = 'info') => {
  switch (variant) {
    case 'danger':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false
}: ConfirmationModalProps) => {
  const contentClasses = cn('space-y-4')
  const iconRowClasses = cn('flex items-start space-x-3')
  const iconClasses = cn('flex-shrink-0')
  const actionsClasses = cn('flex justify-end space-x-3 pt-4')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className={contentClasses}>
        <div className={iconRowClasses}>
          <div className={iconClasses}>
            <Typography.Text color={getVariantColor(variant)}>
              {getVariantIcon(variant)}
            </Typography.Text>
          </div>
          <div className="flex-1">
            <Typography.Title level={5} color={getVariantColor(variant)}>
              {title}
            </Typography.Title>
            <Typography.Text size="sm" color="muted" className="mt-1 block">
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
            variant={getVariantButtonType(variant) as any}
            onClick={onConfirm}
            disabled={isLoading}
            className={isLoading ? 'animate-pulse-subtle' : ''}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
