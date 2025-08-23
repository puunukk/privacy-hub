/**
 * @fileoverview Reusable list input component for managing arrays of strings
 * @author Privacy Hub Dashboard
 */

import React, { Component } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * Props for the ListInput component
 */
interface ListInputProps {
  /** Unique identifier for the input */
  id?: string;
  /** Field label text */
  label: string;
  /** Current array of items */
  items: string[];
  /** Callback when items array changes */
  onChange: (items: string[]) => void;
  /** Placeholder text for new item input */
  placeholder?: string;
  /** Optional help text displayed below the input */
  helpText?: string | React.ReactNode;
  /** Optional tooltip text */
  tooltip?: string;
  /** Optional documentation link */
  docLink?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Component state interface
 */
interface ListInputState {
  /** Current new item being typed */
  newItem: string;
}

/**
 * List input component for managing arrays of strings with add/remove functionality
 * 
 * @component
 * @example
 * ```tsx
 * <ListInput
 *   label="Output Formats"
 *   items={['html', 'json']}
 *   onChange={(items) => setFormats(items)}
 *   placeholder="html, json, csv, rss"
 *   helpText="Supported output formats"
 * />
 * ```
 */
export class ListInput extends Component<ListInputProps, ListInputState> {
  constructor(props: ListInputProps) {
    super(props);
    this.state = {
      newItem: ''
    };
  }

  /**
   * Add a new item to the list
   */
  private handleAddItem = () => {
    const { newItem } = this.state;
    const { items, onChange } = this.props;

    if (newItem.trim() && !items.includes(newItem.trim())) {
      onChange([...items, newItem.trim()]);
      this.setState({ newItem: '' });
    }
  };

  /**
   * Remove an item from the list
   */
  private handleRemoveItem = (index: number) => {
    const { items, onChange } = this.props;
    onChange(items.filter((_, i) => i !== index));
  };

  /**
   * Handle Enter key to add item
   */
  private handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleAddItem();
    }
  };

  /**
   * Generate a unique ID if none provided
   */
  private getFieldId = (): string => {
    const { id, label } = this.props;
    return id || `list-${label.toLowerCase().replace(/\s+/g, '-')}`;
  };

  render() {
    const { label, items, placeholder, helpText, tooltip, docLink, className = '' } = this.props;
    const { newItem } = this.state;
    
    const fieldId = this.getFieldId();

    return (
      <div className={`mb-4 ${className}`}>
        <label htmlFor={fieldId} className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>{label}</span>
          {tooltip && (
            <div className="relative inline-block ml-2">
              <span
                className="inline-flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors cursor-help"
                title={tooltip}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          )}
        </label>

        {/* Add new item input */}
        <div className="flex gap-2 mb-2">
          <input
            id={fieldId}
            type="text"
            value={newItem}
            onChange={(e) => this.setState({ newItem: e.target.value })}
            onKeyPress={this.handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors duration-200"
          />
          <button
            type="button"
            onClick={this.handleAddItem}
            disabled={!newItem.trim() || items.includes(newItem.trim())}
            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Current items list */}
        {items.length > 0 && (
          <div className="space-y-1 mb-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item}</span>
                <button
                  type="button"
                  onClick={() => this.handleRemoveItem(index)}
                  className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Help text */}
        {helpText && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {typeof helpText === 'string' ? helpText : helpText}
          </div>
        )}

        {/* Documentation link */}
        {docLink && (
          <div className="mt-1">
            <a
              href={docLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              Read documentation
            </a>
          </div>
        )}
      </div>
    );
  }
}