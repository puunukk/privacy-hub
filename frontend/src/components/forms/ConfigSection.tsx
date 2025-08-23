/**
 * @fileoverview Reusable configuration section wrapper component
 * @author Privacy Hub Dashboard
 */

import { Component } from 'react';

/**
 * Props for the ConfigSection component
 */
interface ConfigSectionProps {
  /** Section title */
  title: string;
  /** Section content */
  children: React.ReactNode;
  /** Optional section description */
  description?: string;
  /** Optional documentation link */
  docLink?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the content area */
  contentClassName?: string;
  /** Whether the section is collapsible */
  collapsible?: boolean;
  /** Initial collapsed state (only used if collapsible is true) */
  defaultCollapsed?: boolean;
}

interface ConfigSectionState {
  isCollapsed: boolean;
}

/**
 * Reusable configuration section wrapper with consistent styling and optional collapsible functionality
 * 
 * @component
 * @example
 * ```tsx
 * <ConfigSection 
 *   title="General Settings"
 *   description="Configure basic instance settings"
 * >
 *   <FormField label="Instance Name" value={name} onChange={setName} />
 * </ConfigSection>
 * ```
 */
export class ConfigSection extends Component<ConfigSectionProps, ConfigSectionState> {
  constructor(props: ConfigSectionProps) {
    super(props);
    this.state = {
      isCollapsed: props.defaultCollapsed || false
    };
  }

  /**
   * Toggle collapsed state
   */
  toggleCollapsed = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  /**
   * Handle keyboard interaction for collapsible sections
   */
  handleKeyDown = (e: React.KeyboardEvent) => {
    if (this.props.collapsible && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      this.toggleCollapsed();
    }
  };

  render() {
    const { title, children, description, docLink, className = '', contentClassName = '', collapsible = false } = this.props;
    const { isCollapsed } = this.state;

    const headerClasses = collapsible 
      ? 'cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded'
      : '';

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Section Header */}
        <div
          className={headerClasses}
          onClick={collapsible ? this.toggleCollapsed : undefined}
          onKeyDown={this.handleKeyDown}
          tabIndex={collapsible ? 0 : undefined}
          role={collapsible ? 'button' : undefined}
          aria-expanded={collapsible ? !isCollapsed : undefined}
          aria-controls={collapsible ? `section-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
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
            
            {collapsible && (
              <div className="ml-4">
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    isCollapsed ? 'rotate-0' : 'rotate-180'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Section Content */}
        {(!collapsible || !isCollapsed) && (
          <div
            id={collapsible ? `section-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined}
            className={`space-y-4 ${contentClassName}`}
            role={collapsible ? 'region' : undefined}
            aria-labelledby={collapsible ? `section-${title.toLowerCase().replace(/\s+/g, '-')}-header` : undefined}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
}