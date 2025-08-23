/**
 * @fileoverview Reusable action buttons component for configuration forms
 * @author Privacy Hub Dashboard
 */

import React from 'react';
import { Download, RotateCcw, Save, X } from 'lucide-react';

/**
 * Button configuration interface
 */
interface ButtonConfig {
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant/style */
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  /** Button icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is loading */
  loading?: boolean;
}

/**
 * Props for the ActionButtons component
 */
interface ActionButtonsProps {
  /** Primary action buttons (shown on the right) */
  primaryActions?: ButtonConfig[];
  /** Secondary action buttons (shown on the left) */
  secondaryActions?: ButtonConfig[];
  /** Additional CSS classes for the container */
  className?: string;
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
}

/**
 * Reusable action buttons component with consistent styling and common patterns
 * 
 * @component
 * @example
 * ```tsx
 * <ActionButtons
 *   primaryActions={[
 *     {
 *       label: 'Download Config',
 *       onClick: downloadConfig,
 *       variant: 'primary',
 *       icon: Download
 *     }
 *   ]}
 *   secondaryActions={[
 *     {
 *       label: 'Reset to Defaults',
 *       onClick: resetDefaults,
 *       variant: 'danger',
 *       icon: RotateCcw
 *     }
 *   ]}
 * />
 * ```
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  primaryActions = [],
  secondaryActions = [],
  className = '',
  layout = 'horizontal'
}) => {
  /**
   * Get button CSS classes based on variant
   */
  const getButtonClasses = (variant: ButtonConfig['variant'] = 'secondary', _disabled = false, loading = false): string => {
    const baseClasses = 'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:ring-gray-300',
      danger: 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 focus:ring-red-300',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
    };

    const variantClasses = variants[variant];
    const stateClasses = loading ? 'cursor-wait' : '';

    return `${baseClasses} ${variantClasses} ${stateClasses}`;
  };

  /**
   * Render a single button
   */
  const renderButton = (button: ButtonConfig, index: number) => {
    const IconComponent = button.icon;
    
    return (
      <button
        key={`${button.label}-${index}`}
        type="button"
        onClick={button.onClick}
        disabled={button.disabled || button.loading}
        className={getButtonClasses(button.variant, button.disabled, button.loading)}
        aria-label={button.label}
      >
        {button.loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          IconComponent && <IconComponent className="w-4 h-4" />
        )}
        <span>{button.label}</span>
      </button>
    );
  };

  const containerClasses = layout === 'vertical' 
    ? 'flex flex-col space-y-3'
    : 'flex justify-between items-center';

  const primaryGroupClasses = layout === 'vertical'
    ? 'flex flex-col space-y-2 w-full'
    : 'flex space-x-3';

  const secondaryGroupClasses = layout === 'vertical'
    ? 'flex flex-col space-y-2 w-full'
    : 'flex space-x-3';

  return (
    <div className={`pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <div className={containerClasses}>
        {/* Secondary actions (left side or top in vertical) */}
        {secondaryActions.length > 0 && (
          <div className={secondaryGroupClasses}>
            {secondaryActions.map((button, index) => renderButton(button, index))}
          </div>
        )}

        {/* Primary actions (right side or bottom in vertical) */}
        {primaryActions.length > 0 && (
          <div className={primaryGroupClasses}>
            {primaryActions.map((button, index) => renderButton(button, index))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Common pre-configured action buttons for convenience
 */
export const CommonActions = {
  /**
   * Download configuration action
   */
  download: (onClick: () => void, disabled = false): ButtonConfig => ({
    label: 'Download Config',
    onClick,
    variant: 'primary',
    icon: Download,
    disabled
  }),

  /**
   * Save configuration action
   */
  save: (onClick: () => void, disabled = false, loading = false): ButtonConfig => ({
    label: 'Save',
    onClick,
    variant: 'success',
    icon: Save,
    disabled,
    loading
  }),

  /**
   * Reset to defaults action
   */
  reset: (onClick: () => void, disabled = false): ButtonConfig => ({
    label: 'Reset to Defaults',
    onClick,
    variant: 'danger',
    icon: RotateCcw,
    disabled
  }),

  /**
   * Cancel action
   */
  cancel: (onClick: () => void, disabled = false): ButtonConfig => ({
    label: 'Cancel',
    onClick,
    variant: 'secondary',
    icon: X,
    disabled
  })
};