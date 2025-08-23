/**
 * @fileoverview Reusable tab navigation component for configuration forms
 * @author Privacy Hub Dashboard
 */

import React from 'react';
import { ConfigTab } from './types';

/**
 * Props for the TabNavigation component
 */
interface TabNavigationProps {
  /** Currently active tab */
  activeTab: ConfigTab;
  /** Available tabs to display */
  tabs: readonly ConfigTab[];
  /** Callback when tab is clicked */
  onTabChange: (tab: ConfigTab) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable tab navigation component with consistent styling
 * 
 * @component
 * @example
 * ```tsx
 * <TabNavigation
 *   activeTab="general"
 *   tabs={['general', 'search', 'server']}
 *   onTabChange={(tab) => setActiveTab(tab)}
 * />
 * ```
 */
export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  tabs,
  onTabChange,
  className = ''
}) => {
  /**
   * Get CSS classes for a tab button based on active state
   * 
   * @param tab - The tab to get classes for
   * @returns CSS class string
   */
  const getTabClasses = (tab: ConfigTab): string => {
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-lg transition-colors';
    const activeClasses = 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    const inactiveClasses = 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200';
    
    return `${baseClasses} ${activeTab === tab ? activeClasses : inactiveClasses}`;
  };

  /**
   * Capitalize the first letter of a string
   * 
   * @param str - String to capitalize
   * @returns Capitalized string
   */
  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className={`mb-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <nav className="flex space-x-2 pb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={getTabClasses(tab)}
            aria-selected={activeTab === tab}
            role="tab"
          >
            {capitalize(tab)}
          </button>
        ))}
      </nav>
    </div>
  );
};