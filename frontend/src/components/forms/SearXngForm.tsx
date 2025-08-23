/**
 * @fileoverview SearXNG configuration form component using reusable form components
 * @author Privacy Hub Dashboard
 */

import { Component } from 'react';
import {
  SearXngSettings,
  ConfigTab,
  TabNavigation,
  FormField,
  FormSelect,
  FormCheckbox,
  EngineCard,
  ActionButtons,
  ConfigSection,
  CommonActions
} from './index';

/**
 * Generate a cryptographically secure random string for secret keys
 * 
 * @returns Random string suitable for use as a secret key
 */
function generateRandomString(): string {
  // Try to use crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fall back to alternative method if crypto.randomUUID fails
    }
  }

  // Fallback method using crypto.getRandomValues if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Final fallback using Math.random (less secure but functional)
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

/**
 * Default SearXNG configuration settings
 */
const defaultSettings: SearXngSettings = {
  use_default_settings: true,
  general: {
    debug: false,
    instance_name: "Privacy Hub Search",
    privacypolicy_url: false,
    donation_url: false,
    contact_url: "https://github.com/searxng/searxng",
    enable_metrics: true
  },
  search: {
    safe_search: 1,
    autocomplete: "google",
    default_lang: "en",
    formats: ['html', 'json'],
    ban_time_on_fail: 5,
    max_ban_time_on_fail: 120
  },
  server: {
    port: 8080,
    bind_address: "0.0.0.0",
    secret_key: generateRandomString(),
    base_url: false,
    limiter: false,
    image_proxy: true,
    http_protocol_version: '1.0',
    method: 'POST',
    public_instance: false
  },
  ui: {
    default_theme: "simple",
    static_use_hash: false,
    query_in_title: false,
    infinite_scroll: false,
    center_alignment: false
  },
  engines: [
    { name: "google", engine: "google", disabled: false, weight: 1.0 },
    { name: "bing", engine: "bing", disabled: false, weight: 0.8 },
    { name: "duckduckgo", engine: "duckduckgo", disabled: false, weight: 1.0 },
    { name: "startpage", engine: "startpage", disabled: false, weight: 0.9 },
    { name: "wikipedia", engine: "wikipedia", disabled: false, weight: 1.0 }
  ]
};

/**
 * Component state interface
 */
interface SearxngConfigState {
  /** Current configuration settings */
  settings: SearXngSettings;
  /** Currently active tab */
  activeTab: ConfigTab;
}

/**
 * Props interface for the SearXngForm component
 */
interface SearXngFormProps {
  /** Optional initial settings */
  initialSettings?: Partial<SearXngSettings>;
  /** Callback when settings are saved/downloaded */
  onSave?: (settings: SearXngSettings) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SearXNG configuration form component with tabbed interface and reusable components
 * 
 * @component
 * @example
 * ```tsx
 * <SearXngForm
 *   initialSettings={{ general: { instance_name: "My Search" } }}
 *   onSave={(settings) => console.log('Settings saved:', settings)}
 * />
 * ```
 */
export class SearXngForm extends Component<SearXngFormProps, SearxngConfigState> {
  constructor(props: SearXngFormProps) {
    super(props);

    // Merge initial settings with defaults
    const mergedSettings = props.initialSettings
      ? { ...defaultSettings, ...props.initialSettings }
      : defaultSettings;

    this.state = {
      settings: mergedSettings,
      activeTab: 'general'
    };
  }

  /**
   * Update a setting in a specific section
   * 
   * @param section - The settings section to update
   * @param key - The setting key to update
   * @param value - The new value
   */
  updateSetting = (section: keyof SearXngSettings, key: string, value: any) => {
    this.setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [section]: {
          ...(prev.settings[section] as any || {}),
          [key]: value
        }
      }
    }));
  };

  /**
   * Update engine-specific settings
   * 
   * @param engineIndex - Engine index in the array
   * @param key - Setting key (disabled or weight)
   * @param value - New value
   */
  updateEngineSettings = (engineIndex: number, key: 'disabled' | 'weight', value: any) => {
    this.setState(prev => {
      if (!prev.settings.engines || !Array.isArray(prev.settings.engines)) {
        return prev;
      }
      
      const updatedEngines = [...prev.settings.engines];
      updatedEngines[engineIndex] = {
        ...updatedEngines[engineIndex],
        [key]: value
      };
      
      return {
        ...prev,
        settings: {
          ...prev.settings,
          engines: updatedEngines
        }
      };
    });
  };

  /**
   * Set the active tab
   * 
   * @param tab - Tab to activate
   */
  setActiveTab = (tab: ConfigTab) => {
    this.setState({ activeTab: tab });
  };

  /**
   * Generate YAML configuration from current settings
   * 
   * @returns YAML configuration string
   */
  generateYamlConfig = (): string => {
    const { settings } = this.state;
    return `# SearXNG Configuration
# Generated by Privacy Hub Dashboard

use_default_settings: ${settings.use_default_settings}

general:
  debug: ${settings.general?.debug ?? false}
  instance_name: "${settings.general?.instance_name || 'SearXNG'}"
  contact_url: ${settings.general?.contact_url ? `"${settings.general.contact_url}"` : 'false'}
  enable_metrics: ${settings.general?.enable_metrics ?? true}

search:
  safe_search: ${settings.search?.safe_search ?? 1}
  autocomplete: "${settings.search?.autocomplete || 'google'}"
  default_lang: "${settings.search?.default_lang || 'en'}"
  formats: ${JSON.stringify(settings.search?.formats || ['html', 'json'])}
  ban_time_on_fail: ${settings.search?.ban_time_on_fail ?? 5}
  max_ban_time_on_fail: ${settings.search?.max_ban_time_on_fail ?? 120}

server:
  port: ${settings.server?.port ?? 8080}
  bind_address: "${settings.server?.bind_address || '0.0.0.0'}"
  secret_key: "${settings.server?.secret_key || 'changeme'}"
  base_url: ${settings.server?.base_url ? `"${settings.server.base_url}"` : 'false'}
  limiter: ${settings.server?.limiter ?? false}
  image_proxy: ${settings.server?.image_proxy ?? false}
  http_protocol_version: "${settings.server?.http_protocol_version || '1.0'}"
  method: "${settings.server?.method || 'POST'}"
  public_instance: ${settings.server?.public_instance ?? false}

ui:
  default_theme: "${settings.ui?.default_theme || 'simple'}"
  static_use_hash: ${settings.ui?.static_use_hash ?? false}
  query_in_title: ${settings.ui?.query_in_title ?? false}
  infinite_scroll: ${settings.ui?.infinite_scroll ?? false}
  center_alignment: ${settings.ui?.center_alignment ?? false}

engines:
${(settings.engines || []).map((engine) =>
      `  - name: ${engine.name}
    engine: ${engine.engine}
    disabled: ${engine.disabled || false}
    weight: ${engine.weight || 1.0}`
    ).join('\n')}
`;
  };

  /**
   * Download configuration as YAML file
   */
  downloadConfig = () => {
    const config = this.generateYamlConfig();
    const blob = new Blob([config], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'searxng-settings.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Call onSave callback if provided
    if (this.props.onSave) {
      this.props.onSave(this.state.settings);
    }
  };

  /**
   * Reset all settings to defaults with confirmation
   */
  resetToDefaults = () => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      this.setState({ settings: defaultSettings });
    }
  };

  /**
   * Render the general settings tab content
   */
  renderGeneralTab = () => {
    const { settings } = this.state;

    return (
      <ConfigSection title="General Settings" description="Configure basic instance settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Instance Name"
            value={settings.general?.instance_name || ''}
            onChange={(value) => this.updateSetting('general', 'instance_name', value)}
            placeholder="Enter instance name"
          />

          <FormField
            label="Contact URL"
            type="url"
            value={settings.general?.contact_url || ''}
            onChange={(value) => this.updateSetting('general', 'contact_url', value)}
            placeholder="https://example.com/contact"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormCheckbox
            label="Debug Mode"
            checked={settings.general?.debug || false}
            onChange={(checked) => this.updateSetting('general', 'debug', checked)}
            helpText="Enable detailed logging (disable in production)"
          />

          <FormCheckbox
            label="Enable Metrics"
            checked={settings.general?.enable_metrics ?? true}
            onChange={(checked) => this.updateSetting('general', 'enable_metrics', checked)}
            helpText="Collect anonymous usage statistics"
          />
        </div>
      </ConfigSection>
    );
  };

  /**
   * Render the search settings tab content
   */
  renderSearchTab = () => {
    const { settings } = this.state;

    const safeSearchOptions = [
      { value: 0, label: 'Off' },
      { value: 1, label: 'Moderate' },
      { value: 2, label: 'Strict' }
    ];

    const languageOptions = [
      { value: 'en', label: 'English' },
      { value: 'de', label: 'German' },
      { value: 'fr', label: 'French' },
      { value: 'es', label: 'Spanish' },
      { value: 'it', label: 'Italian' },
      { value: 'pt', label: 'Portuguese' },
      { value: 'ru', label: 'Russian' },
      { value: 'ja', label: 'Japanese' },
      { value: 'zh', label: 'Chinese' }
    ];

    return (
      <ConfigSection title="Search Settings" description="Configure search behavior and defaults">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Safe Search Level"
            value={settings.search?.safe_search || 1}
            options={safeSearchOptions}
            onChange={(value) => this.updateSetting('search', 'safe_search', parseInt(value.toString()))}
          />

          <FormSelect
            label="Default Language"
            value={settings.search?.default_lang || 'en'}
            options={languageOptions}
            onChange={(value) => this.updateSetting('search', 'default_lang', value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Ban Time on Fail (seconds)"
            type="number"
            value={settings.search?.ban_time_on_fail || 5}
            onChange={(value) => this.updateSetting('search', 'ban_time_on_fail', parseInt(value) || 5)}
            helpText="Temporary ban duration for failing search engines"
          />

          <FormField
            label="Max Ban Time (seconds)"
            type="number"
            value={settings.search?.max_ban_time_on_fail || 120}
            onChange={(value) => this.updateSetting('search', 'max_ban_time_on_fail', parseInt(value) || 120)}
            helpText="Maximum ban duration for repeatedly failing engines"
          />
        </div>
      </ConfigSection>
    );
  };

  /**
   * Render the engines tab content
   */
  renderEnginesTab = () => {
    const { settings } = this.state;

    return (
      <ConfigSection title="Search Engines" description="Configure individual search engines and their priorities">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(settings.engines || []).map((config, index) => (
            <EngineCard
              key={config.name || index}
              engineName={config.name || 'Unknown'}
              config={config}
              onEnabledChange={(enabled) => this.updateEngineSettings(index, 'disabled', !enabled)}
              onWeightChange={(weight) => this.updateEngineSettings(index, 'weight', weight)}
            />
          ))}
        </div>
      </ConfigSection>
    );
  };

  render() {
    const { activeTab } = this.state;
    const { className = '' } = this.props;

    const tabs: readonly ConfigTab[] = ['general', 'search', 'engines'];

    return (
      <div className={`p-6 ${className}`}>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Configure your private search engine settings and download the configuration file.
        </p>

        <TabNavigation
          activeTab={activeTab}
          tabs={tabs}
          onTabChange={this.setActiveTab}
        />

        <div className="mb-6">
          {activeTab === 'general' && this.renderGeneralTab()}
          {activeTab === 'search' && this.renderSearchTab()}
          {activeTab === 'engines' && this.renderEnginesTab()}
        </div>

        <ActionButtons
          primaryActions={[
            CommonActions.download(this.downloadConfig)
          ]}
          secondaryActions={[
            CommonActions.reset(this.resetToDefaults)
          ]}
        />
      </div>
    );
  }
}