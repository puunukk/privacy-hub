/**
 * @fileoverview Modal wrapper for SearXNG configuration form (Version 2)
 * @author Privacy Hub Dashboard
 */

import React, { Component } from 'react';
import { X } from 'lucide-react';
import { SearXngForm } from './SearXngForm';
import { SearXngSettings } from './types';

/**
 * Props for the SearXngModalForm component
 */
interface SearXngModalFormProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Optional initial settings */
  initialSettings?: Partial<SearXngSettings>;
  /** Callback when settings are saved */
  onSave?: (settings: SearXngSettings) => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether clicking outside closes the modal */
  closeOnOutsideClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
}

/**
 * Component state interface
 */
interface SearXngModalFormState {
  /** Whether the modal is animating */
  isAnimating: boolean;
}

/**
 * Modal wrapper for SearXNG configuration form with responsive design and accessibility features
 * 
 * @component
 * @example
 * ```tsx
 * <SearXngModalForm
 *   isOpen={showConfig}
 *   onClose={() => setShowConfig(false)}
 *   onSave={(settings) => {
 *     console.log('Settings saved:', settings);
 *     setShowConfig(false);
 *   }}
 *   title="Configure Search Engine"
 *   size="lg"
 * />
 * ```
 */
export class SearXngModalForm extends Component<SearXngModalFormProps, SearXngModalFormState> {
  private modalRef = React.createRef<HTMLDivElement>();

  constructor(props: SearXngModalFormProps) {
    super(props);
    this.state = {
      isAnimating: false
    };
  }

  componentDidMount() {
    if (this.props.isOpen && this.props.closeOnEscape !== false) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  componentDidUpdate(prevProps: SearXngModalFormProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      if (this.props.isOpen) {
        this.setState({ isAnimating: true });
        document.body.style.overflow = 'hidden';

        if (this.props.closeOnEscape !== false) {
          document.addEventListener('keydown', this.handleKeyDown);
        }
      } else {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this.handleKeyDown);

        // Delay hiding to allow animation
        setTimeout(() => {
          this.setState({ isAnimating: false });
        }, 150);
      }
    }
  }

  componentWillUnmount() {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Handle keyboard events (primarily Escape key)
   */
  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.props.closeOnEscape !== false) {
      this.props.onClose();
    }
  };

  /**
   * Handle backdrop click
   */
  handleBackdropClick = (e: React.MouseEvent) => {
    if (
      this.props.closeOnOutsideClick !== false &&
      e.target === e.currentTarget
    ) {
      this.props.onClose();
    }
  };

  /**
   * Handle form save with modal close
   */
  handleSave = (settings: SearXngSettings) => {
    if (this.props.onSave) {
      this.props.onSave(settings);
    }
    // Optionally close modal after save
    // this.props.onClose();
  };

  /**
   * Get modal size classes
   */
  getModalSizeClasses = (): string => {
    const { size = 'lg' } = this.props;

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-[95vw] max-h-[95vh]'
    };

    return sizeClasses[size];
  };

  render() {
    const {
      isOpen,
      onClose,
      initialSettings,
      title = 'SearXNG Configuration',
      size = 'lg'
    } = this.props;

    const { isAnimating } = this.state;

    // Don't render if not open and not animating
    if (!isOpen && !isAnimating) {
      return null;
    }

    const modalClasses = `fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0'
      }`;

    const backdropClasses = 'absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm';

    const containerClasses = `relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-transform duration-150 w-full ${this.getModalSizeClasses()
      } ${isOpen ? 'scale-100' : 'scale-95'} ${size === 'full' ? 'h-full overflow-hidden' : 'max-h-[90vh] overflow-y-auto'
      }`;

    return (
      <div
        className={modalClasses}
        onClick={this.handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Backdrop */}
        <div className={backdropClasses} />

        {/* Modal Content */}
        <div
          ref={this.modalRef}
          className={containerClasses}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div
            id="modal-description"
            className={size === 'full' ? 'flex-1 overflow-y-auto' : ''}
          >
            <SearXngForm
              initialSettings={initialSettings}
              onSave={this.handleSave}
              className="border-0 p-0"
            />
          </div>
        </div>
      </div>
    );
  }
}