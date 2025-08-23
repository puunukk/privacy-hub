/**
 * @fileoverview Advanced engine editor component for SearXNG configuration
 * @author Privacy Hub Dashboard
 */

import { Component } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { EngineConfig } from './types';
import { FormField } from './FormField';
import { FormCheckbox } from './FormCheckbox';

/**
 * Props for the EngineEditor component
 */
interface EngineEditorProps {
  /** Array of engine configurations */
  engines: EngineConfig[];
  /** Callback when engines array changes */
  onChange: (engines: EngineConfig[]) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Component state interface
 */
interface EngineEditorState {
  /** Index of engine being edited (-1 for new engine) */
  editingIndex: number | null;
  /** New engine configuration */
  newEngine: EngineConfig;
  /** Whether the add form is expanded */
  showAddForm: boolean;
}

/**
 * Advanced engine editor with full configuration options
 * 
 * @component
 * @example
 * ```tsx
 * <EngineEditor
 *   engines={settings.engines || []}
 *   onChange={(engines) => updateSetting('engines', null, engines)}
 * />
 * ```
 */
export class EngineEditor extends Component<EngineEditorProps, EngineEditorState> {
  constructor(props: EngineEditorProps) {
    super(props);
    
    this.state = {
      editingIndex: null,
      newEngine: this.getDefaultEngine(),
      showAddForm: false
    };
  }

  /**
   * Get default engine configuration
   */
  private getDefaultEngine = (): EngineConfig => ({
    name: '',
    engine: '',
    shortcut: '',
    disabled: false,
    categories: [],
    timeout: 3.0,
    weight: 1
  });

  /**
   * Handle adding a new engine
   */
  private handleAddEngine = () => {
    const { engines, onChange } = this.props;
    const { newEngine } = this.state;

    if (newEngine.name && newEngine.engine) {
      onChange([...engines, { ...newEngine }]);
      this.setState({
        newEngine: this.getDefaultEngine(),
        showAddForm: false
      });
    }
  };

  /**
   * Handle removing an engine
   */
  private handleRemoveEngine = (index: number) => {
    const { engines, onChange } = this.props;
    onChange(engines.filter((_, i) => i !== index));
  };

  /**
   * Handle toggling engine enabled/disabled state
   */
  private handleToggleEngine = (index: number) => {
    const { engines, onChange } = this.props;
    const updated = [...engines];
    updated[index] = { ...updated[index], disabled: !updated[index].disabled };
    onChange(updated);
  };

  /**
   * Update new engine field
   */
  private updateNewEngine = (field: keyof EngineConfig, value: any) => {
    this.setState(prevState => ({
      newEngine: { ...prevState.newEngine, [field]: value }
    }));
  };

  /**
   * Update existing engine field
   */
  private updateEngine = (index: number, field: keyof EngineConfig, value: any) => {
    const { engines, onChange } = this.props;
    const updated = [...engines];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  /**
   * Start editing an engine
   */
  private startEditing = (index: number) => {
    this.setState({ editingIndex: index, showAddForm: false });
  };

  /**
   * Stop editing
   */
  private stopEditing = () => {
    this.setState({ editingIndex: null });
  };

  /**
   * Render engine form fields
   */
  private renderEngineForm = (
    engine: EngineConfig,
    onUpdate: (field: keyof EngineConfig, value: any) => void
  ) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Engine Name"
          value={engine.name}
          onChange={(value) => onUpdate('name', value)}
          placeholder="e.g., google"
          required
        />
        
        <FormField
          label="Engine Type"
          value={engine.engine}
          onChange={(value) => onUpdate('engine', value)}
          placeholder="e.g., google"
          required
        />
        
        <FormField
          label="Shortcut"
          value={engine.shortcut || ''}
          onChange={(value) => onUpdate('shortcut', value)}
          placeholder="e.g., !g"
          helpText="Bang command for this engine"
        />
        
        <FormField
          label="Base URL"
          value={engine.base_url || ''}
          onChange={(value) => onUpdate('base_url', value)}
          placeholder="https://example.com"
          helpText="Custom base URL if needed"
        />
        
        <FormField
          label="Timeout (seconds)"
          type="number"
          value={engine.timeout || 3.0}
          onChange={(value) => onUpdate('timeout', parseFloat(value) || 3.0)}
        />
        
        <FormField
          label="Weight"
          type="number"
          value={engine.weight || 1}
          onChange={(value) => onUpdate('weight', parseFloat(value) || 1)}
          helpText="Search result priority (0-2)"
        />
        
        <FormField
          label="API Key"
          type="password"
          value={engine.api_key || ''}
          onChange={(value) => onUpdate('api_key', value)}
          placeholder="Optional API key"
        />
        
        <FormField
          label="Language"
          value={engine.language || ''}
          onChange={(value) => onUpdate('language', value)}
          placeholder="e.g., en, de, fr"
        />

        <div className="md:col-span-2">
          <FormField
            label="Categories"
            value={(engine.categories || []).join(', ')}
            onChange={(value) => onUpdate('categories', value.split(',').map(c => c.trim()).filter(Boolean))}
            placeholder="general, images, videos, news"
            helpText="Comma-separated list of categories"
          />
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormCheckbox
            label="Disabled"
            checked={engine.disabled || false}
            onChange={(checked) => onUpdate('disabled', checked)}
          />
          
          <FormCheckbox
            label="Enable HTTP"
            checked={engine.enable_http || false}
            onChange={(checked) => onUpdate('enable_http', checked)}
            helpText="Allow HTTP for this engine"
          />
          
          <FormCheckbox
            label="Use Tor Proxy"
            checked={engine.using_tor_proxy || false}
            onChange={(checked) => onUpdate('using_tor_proxy', checked)}
          />
        </div>
      </div>
    );
  };

  render() {
    const { engines, className = '' } = this.props;
    const { editingIndex, newEngine, showAddForm } = this.state;

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Add New Engine Form */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Add New Engine</h3>
            <button
              type="button"
              onClick={() => this.setState({ showAddForm: !showAddForm, editingIndex: null })}
              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? 'Cancel' : 'Add Engine'}
            </button>
          </div>

          {showAddForm && (
            <>
              {this.renderEngineForm(
                newEngine,
                this.updateNewEngine
              )}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={this.handleAddEngine}
                  disabled={!newEngine.name || !newEngine.engine}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Engine
                </button>
                <button
                  type="button"
                  onClick={() => this.setState({ showAddForm: false, newEngine: this.getDefaultEngine() })}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        {/* Existing Engines */}
        {engines.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">
              Configured Engines ({engines.length})
            </h3>
            
            {engines.map((engine, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-lg transition-colors ${
                  editingIndex === index 
                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                {editingIndex === index ? (
                  // Edit form
                  <>
                    {this.renderEngineForm(
                      engine,
                      (field, value) => this.updateEngine(index, field, value)
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={this.stopEditing}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </>
                ) : (
                  // Display view
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={!engine.disabled}
                        onChange={() => this.handleToggleEngine(index)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {engine.name}
                        </span>
                        {engine.shortcut && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({engine.shortcut})
                          </span>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Type: {engine.engine} • Weight: {engine.weight} • Timeout: {engine.timeout}s
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => this.startEditing(index)}
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => this.handleRemoveEngine(index)}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}