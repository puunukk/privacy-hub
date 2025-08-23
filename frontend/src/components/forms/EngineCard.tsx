/**
 * @fileoverview Reusable engine configuration card component for SearXNG settings
 * @author Privacy Hub Dashboard
 */

import React from 'react';
import { EngineConfig } from './types';

/**
 * Props for the EngineCard component
 */
interface EngineCardProps {
  /** Engine name/identifier */
  engineName: string;
  /** Current engine configuration */
  config: EngineConfig;
  /** Callback when engine enabled/disabled state changes */
  onEnabledChange: (enabled: boolean) => void;
  /** Callback when engine weight changes */
  onWeightChange: (weight: number) => void;
  /** Additional CSS classes for the card */
  className?: string;
}

/**
 * Individual search engine configuration card with enable/disable toggle and weight slider
 * 
 * @component
 * @example
 * ```tsx
 * <EngineCard
 *   engineName="google"
 *   config={{ disabled: false, weight: 1.0 }}
 *   onEnabledChange={(enabled) => updateEngine('google', 'disabled', !enabled)}
 *   onWeightChange={(weight) => updateEngine('google', 'weight', weight)}
 * />
 * ```
 */
export const EngineCard: React.FC<EngineCardProps> = ({
  engineName,
  config,
  onEnabledChange,
  onWeightChange,
  className = ''
}) => {
  /**
   * Handle enable/disable toggle change
   */
  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEnabledChange(e.target.checked);
  };

  /**
   * Handle weight slider change
   */
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onWeightChange(parseFloat(e.target.value));
  };

  /**
   * Capitalize the engine name for display
   */
  const displayName = engineName.charAt(0).toUpperCase() + engineName.slice(1);

  /**
   * Generate unique IDs for form elements
   */
  const enabledId = `engine-${engineName}-enabled`;
  const weightId = `engine-${engineName}-weight`;

  return (
    <div className={`border border-gray-200 dark:border-gray-600 rounded-lg p-4 ${className}`}>
      {/* Header with engine name and enable toggle */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {displayName}
        </h4>
        
        <label className="flex items-center cursor-pointer">
          <input
            id={enabledId}
            type="checkbox"
            checked={!config.disabled}
            onChange={handleEnabledChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            aria-describedby={`${enabledId}-label`}
          />
          <span 
            id={`${enabledId}-label`}
            className="ml-2 text-sm text-gray-600 dark:text-gray-400"
          >
            Enabled
          </span>
        </label>
      </div>
      
      {/* Weight slider */}
      <div>
        <label 
          htmlFor={weightId}
          className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
        >
          Weight: {(config.weight || 1).toFixed(1)}
        </label>
        
        <div className="relative">
          <input
            id={weightId}
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.weight}
            onChange={handleWeightChange}
            disabled={config.disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-describedby={`${weightId}-help`}
          />
          
          {/* Weight scale indicators */}
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0.0</span>
            <span>1.0</span>
            <span>2.0</span>
          </div>
        </div>
        
        <p 
          id={`${weightId}-help`}
          className="mt-1 text-xs text-gray-500 dark:text-gray-400"
        >
          Higher weight gives more priority to this search engine
        </p>
      </div>
    </div>
  );
};