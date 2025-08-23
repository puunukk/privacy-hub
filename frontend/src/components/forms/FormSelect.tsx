/**
 * @fileoverview Reusable form select dropdown component with consistent styling
 * @author Privacy Hub Dashboard
 */

import React from 'react';
import { SelectOption } from './types';

/**
 * Props for the FormSelect component
 */
interface FormSelectProps {
  /** Unique identifier for the select */
  id?: string;
  /** Field label text */
  label: string;
  /** Current selected value */
  value: string | number;
  /** Available options */
  options: SelectOption[];
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the select */
  selectClassName?: string;
  /** Callback when selection changes */
  onChange: (value: string | number) => void;
  /** Optional help text displayed below the select */
  helpText?: string;
}

/**
 * Reusable form select dropdown with label and consistent styling
 * 
 * @component
 * @example
 * ```tsx
 * <FormSelect
 *   label="Safe Search Level"
 *   value={safeSearch}
 *   options={[
 *     { value: 0, label: 'Off' },
 *     { value: 1, label: 'Moderate' },
 *     { value: 2, label: 'Strict' }
 *   ]}
 *   onChange={(value) => setSafeSearch(Number(value))}
 * />
 * ```
 */
export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  label,
  value,
  options,
  required = false,
  disabled = false,
  className = '',
  selectClassName = '',
  onChange,
  helpText
}) => {
  /**
   * Handle select change and pass the appropriate value type
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    // Try to convert to number if the original value was a number
    const numValue = Number(selectedValue);
    if (!isNaN(numValue) && typeof value === 'number') {
      onChange(numValue);
    } else {
      onChange(selectedValue);
    }
  };

  /**
   * Generate a unique ID if none provided
   */
  const fieldId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const baseSelectClasses = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed';

  return (
    <div className={className}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={fieldId}
        value={value}
        required={required}
        disabled={disabled}
        onChange={handleChange}
        className={`${baseSelectClasses} ${selectClassName}`}
        aria-describedby={helpText ? `${fieldId}-help` : undefined}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
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