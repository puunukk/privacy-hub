/**
 * @fileoverview Reusable form checkbox component with consistent styling
 * @author Privacy Hub Dashboard
 */

import React from 'react';

/**
 * Props for the FormCheckbox component
 */
interface FormCheckboxProps {
  /** Unique identifier for the checkbox */
  id?: string;
  /** Field label text */
  label: string;
  /** Current checked state */
  checked: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the checkbox */
  checkboxClassName?: string;
  /** Callback when checkbox state changes */
  onChange: (checked: boolean) => void;
  /** Optional help text displayed below the checkbox */
  helpText?: string;
  /** Layout direction: horizontal (default) or vertical */
  layout?: 'horizontal' | 'vertical';
}

/**
 * Reusable form checkbox with label and consistent styling
 * 
 * @component
 * @example
 * ```tsx
 * <FormCheckbox
 *   label="Enable HTTP"
 *   checked={enableHttp}
 *   onChange={(checked) => setEnableHttp(checked)}
 *   helpText="Not recommended for production"
 * />
 * ```
 */
export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  id,
  label,
  checked,
  required = false,
  disabled = false,
  className = '',
  checkboxClassName = '',
  onChange,
  helpText,
  layout = 'horizontal'
}) => {
  /**
   * Handle checkbox change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  /**
   * Generate a unique ID if none provided
   */
  const fieldId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const baseCheckboxClasses = 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed';

  const containerClasses = layout === 'vertical' 
    ? 'flex flex-col space-y-2'
    : 'flex items-center';

  const labelClasses = layout === 'vertical'
    ? 'text-sm font-medium text-gray-700 dark:text-gray-300'
    : 'ml-2 text-sm text-gray-700 dark:text-gray-300';

  return (
    <div className={`${className}`}>
      <div className={containerClasses}>
        {layout === 'vertical' && (
          <label 
            htmlFor={fieldId}
            className={labelClasses}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="flex items-center">
          <input
            id={fieldId}
            type="checkbox"
            checked={checked}
            required={required}
            disabled={disabled}
            onChange={handleChange}
            className={`${baseCheckboxClasses} ${checkboxClassName}`}
            aria-describedby={helpText ? `${fieldId}-help` : undefined}
          />
          
          {layout === 'horizontal' && (
            <label 
              htmlFor={fieldId}
              className={`${labelClasses} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
      </div>
      
      {helpText && (
        <p 
          id={`${fieldId}-help`}
          className="mt-1 text-sm text-gray-500 dark:text-gray-400"
        >
          {helpText}
        </p>
      )}
    </div>
  );
};