/**
 * @fileoverview Reusable form input field component with consistent styling
 * @author Privacy Hub Dashboard
 */

import React from 'react';

/**
 * Props for the FormField component
 */
interface FormFieldProps {
  /** Unique identifier for the input */
  id?: string;
  /** Field label text */
  label: string;
  /** Input type (text, email, url, number, etc.) */
  type?: string;
  /** Step attribute for number inputs */
  step?: string | number;
  /** Current input value */
  value: string | number;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the input */
  inputClassName?: string;
  /** Callback when input value changes */
  onChange: (value: string) => void;
  /** Optional help text displayed below the input */
  helpText?: string | React.ReactNode;
}

/**
 * Reusable form input field with label and consistent styling
 * 
 * @component
 * @example
 * ```tsx
 * <FormField
 *   label="Instance Name"
 *   value={instanceName}
 *   onChange={(value) => setInstanceName(value)}
 *   placeholder="Enter instance name"
 * />
 * ```
 */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  step,
  value,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  onChange,
  helpText
}) => {
  /**
   * Handle input change and normalize value to string
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  /**
   * Generate a unique ID if none provided
   */
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const baseInputClasses = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed';

  return (
    <div className={className}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={fieldId}
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={handleChange}
        className={`${baseInputClasses} ${inputClassName}`}
        aria-describedby={helpText ? `${fieldId}-help` : undefined}
      />
      
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