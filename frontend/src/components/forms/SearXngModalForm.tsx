/**
 * @fileoverview Modal wrapper for SearXNG configuration form (Version 2)
 * @author Privacy Hub Dashboard
 */

import { Component } from 'react';
import { Modal } from '@/components/ui/Modal';
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
  size?: 'sm' | 'md' | 'lg';
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
export class SearXngModalForm extends Component<SearXngModalFormProps> {

  /**
   * Handle form save with modal close
   */
  handleSave = (settings: SearXngSettings) => {
    if (this.props.onSave) {
      this.props.onSave(settings);
    }
  };

  render() {
    const {
      isOpen,
      onClose,
      initialSettings,
      title = 'SearXNG Configuration',
      size = 'lg'
    } = this.props;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size={size}
      >
        <SearXngForm
          initialSettings={initialSettings}
          onSave={this.handleSave}
          className="border-0 p-0"
        />
      </Modal>
    );
  }
}