/**
 * @fileoverview Comprehensive SearXNG configuration form with ALL features from OriginalVer.tsx
 * @author Privacy Hub Dashboard
 */

import { Component } from 'react';
import { KeyRound, Download, FileCode, AlertCircle } from 'lucide-react';
import {
  SearXngSettings,
  ConfigTab,
  TabNavigation,
  FormField,
  FormSelect,
  FormCheckbox,
  ActionButtons,
  ConfigSection,
  ListInput,
  EngineEditor,
  CommonActions
} from './index';

/**
 * Generate a cryptographically secure random string for secret keys
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
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * Default comprehensive SearXNG configuration settings (matching OriginalVer.tsx)
 */
const defaultSettings: SearXngSettings = {
  use_default_settings: true,
  general: {
    debug: false,
    instance_name: 'SearXNG',
    privacypolicy_url: false,
    donation_url: 'https://docs.searxng.org/donate.html',
    contact_url: false,
    enable_metrics: true
  },
  brand: {
    issue_url: 'https://github.com/searxng/searxng/issues',
    docs_url: 'https://docs.searxng.org',
    public_instances: 'https://searx.space',
    wiki_url: 'https://github.com/searxng/searxng/wiki'
  },
  search: {
    safe_search: 2,
    autocomplete: 'duckduckgo',
    default_lang: '',
    formats: ['html', 'json'],
    ban_time_on_fail: 5,
    max_ban_time_on_fail: 120
  },
  server: {
    port: 8888,
    bind_address: '127.0.0.1',
    secret_key: 'ultrasecretkey',
    base_url: false,
    limiter: false,
    image_proxy: false,
    http_protocol_version: '1.0',
    method: 'POST',
    public_instance: false,
    default_http_headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Download-Options': 'noopen',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer'
    }
  },
  ui: {
    static_path: '',
    static_use_hash: false,
    templates_path: '',
    query_in_title: false,
    infinite_scroll: false,
    default_theme: 'simple',
    center_alignment: false,
    cache_url: 'https://web.archive.org/web/'
  },
  redis: {
    url: false
  },
  valkey: {
    url: false
  },
  outgoing: {
    request_timeout: 3.0,
    max_request_timeout: 15.0,
    useragent_suffix: '',
    pool_connections: 100,
    pool_maxsize: 20,
    enable_http2: true,
    using_tor_proxy: false,
    extra_proxy_timeout: 0
  },
  categories_as_tabs: ['general', 'images', 'videos', 'news', 'map', 'music', 'it', 'science', 'files', 'social media'],
  engines: [],
  plugins: {}
};

/**
 * Component state interface
 */
interface ComprehensiveSearXngFormState {
  /** Current configuration settings */
  settings: SearXngSettings;
  /** Currently active tab */
  activeTab: ConfigTab;
  /** Generated YAML output */
  yamlOutput: string;
  /** Whether to show YAML output */
  showYaml: boolean;
}

/**
 * Props interface for the ComprehensiveSearXngForm component
 */
interface ComprehensiveSearXngFormProps {
  /** Optional initial settings */
  initialSettings?: Partial<SearXngSettings>;
  /** Callback when settings are saved/downloaded */
  onSave?: (settings: SearXngSettings) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Comprehensive SearXNG configuration form with ALL features and settings
 * 
 * @component
 * @example
 * ```tsx
 * <ComprehensiveSearXngForm
 *   initialSettings={{ general: { instance_name: "My Search" } }}
 *   onSave={(settings) => console.log('Settings saved:', settings)}
 * />
 * ```
 */
export class ComprehensiveSearXngForm extends Component<ComprehensiveSearXngFormProps, ComprehensiveSearXngFormState> {
  constructor(props: ComprehensiveSearXngFormProps) {
    super(props);
    
    // Merge initial settings with defaults
    const mergedSettings = props.initialSettings 
      ? this.mergeConfigs(defaultSettings, props.initialSettings)
      : defaultSettings;
    
    this.state = {
      settings: mergedSettings,
      activeTab: 'base',
      yamlOutput: '',
      showYaml: false
    };
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfigs = (base: SearXngSettings, override: Partial<SearXngSettings>): SearXngSettings => {
    const merged = { ...base };
    
    for (const [key, value] of Object.entries(override)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const baseValue = merged[key as keyof SearXngSettings];
        if (baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue)) {
          merged[key as keyof SearXngSettings] = {
            ...baseValue,
            ...value
          } as any;
        } else {
          merged[key as keyof SearXngSettings] = value as any;
        }
      } else if (value !== undefined) {
        merged[key as keyof SearXngSettings] = value as any;
      }
    }
    
    return merged;
  };

  /**
   * Update a setting in a specific section
   */
  private updateSetting = (section: keyof SearXngSettings, key: string | null, value: any) => {
    this.setState(prevState => {
      const newSettings = { ...prevState.settings };

      if (key === null) {
        // Direct assignment for arrays and simple values
        (newSettings as any)[section] = value;
      } else if (typeof newSettings[section] === 'object' && newSettings[section] !== null) {
        // Update nested object
        (newSettings as any)[section] = {
          ...(newSettings as any)[section],
          [key]: value
        };
      }

      return { settings: newSettings };
    });
  };

  /**
   * Set the active tab
   */
  private setActiveTab = (tab: ConfigTab) => {
    this.setState({ activeTab: tab });
  };

  /**
   * Generate a new secret key
   */
  private generateSecretKey = () => {
    const key = generateRandomString();
    this.updateSetting('server', 'secret_key', key);
  };

  /**
   * Generate YAML configuration from current settings
   */
  private generateYamlConfig = (): string => {
    const { settings } = this.state;
    
    // Simple YAML generator (matches OriginalVer.tsx logic)
    const toYAML = (obj: any, indent: number = 0): string => {
      const spaces = '  '.repeat(indent);
      let result = '';

      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) continue;

        result += `${spaces}${key}:`;

        if (typeof value === 'object' && !Array.isArray(value)) {
          result += '\n' + toYAML(value, indent + 1);
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            result += ' []\n';
          } else if (typeof value[0] === 'string') {
            result += '\n';
            value.forEach(item => {
              result += `${spaces}  - ${item}\n`;
            });
          } else {
            result += '\n';
            value.forEach(item => {
              result += `${spaces}  - `;
              const itemYaml = toYAML(item, indent + 2);
              result += itemYaml.substring(spaces.length + 4) + '\n';
            });
          }
        } else if (typeof value === 'boolean') {
          result += ` ${value}\n`;
        } else if (typeof value === 'string') {
          // Don't quote false as string
          if (value === 'false') {
            result += ` false\n`;
          } else {
            result += ` "${value}"\n`;
          }
        } else {
          result += ` ${value}\n`;
        }
      }

      return result;
    };

    return toYAML(settings);
  };

  /**
   * Download configuration as YAML file
   */
  private downloadConfig = () => {
    const config = this.generateYamlConfig();
    const blob = new Blob([config], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.yml';
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
   * Generate and show YAML
   */
  private showYamlOutput = () => {
    const yaml = this.generateYamlConfig();
    this.setState({ yamlOutput: yaml, showYaml: true });
  };

  /**
   * Reset all settings to defaults with confirmation
   */
  private resetToDefaults = () => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      this.setState({ settings: defaultSettings });
    }
  };

  /**
   * Render the base configuration tab
   */
  private renderBaseTab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="Base Configuration" 
        description="Core settings for your SearXNG instance"
        docLink="https://docs.searxng.org/admin/settings/settings.html#settings-use-default-settings"
      >
        <FormCheckbox
          label="Use Default Settings"
          checked={settings.use_default_settings}
          onChange={(checked) => this.updateSetting('use_default_settings', null, checked)}
          helpText="When enabled, your custom settings will extend the default configuration"
          layout="vertical"
        />
      </ConfigSection>
    );
  };

  /**
   * Render the brand settings tab
   */
  private renderBrandTab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="Brand Settings" 
        description="Branding and external links"
        docLink="https://docs.searxng.org/admin/settings/settings_brand.html"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Issue Tracker URL"
            type="url"
            value={settings.brand?.issue_url || ''}
            onChange={(value) => this.updateSetting('brand', 'issue_url', value)}
            placeholder="https://github.com/yourusername/searxng/issues"
            helpText="Link to your instance's issue tracker"
          />

          <FormField
            label="Documentation URL"
            type="url"
            value={settings.brand?.docs_url || ''}
            onChange={(value) => this.updateSetting('brand', 'docs_url', value)}
            placeholder="https://docs.searxng.org"
            helpText="Link to documentation"
          />

          <FormField
            label="Public Instances URL"
            type="url"
            value={settings.brand?.public_instances || ''}
            onChange={(value) => this.updateSetting('brand', 'public_instances', value)}
            placeholder="https://searx.space"
            helpText="Link to public instances list"
          />

          <FormField
            label="Wiki URL"
            type="url"
            value={settings.brand?.wiki_url || ''}
            onChange={(value) => this.updateSetting('brand', 'wiki_url', value)}
            placeholder="https://github.com/searxng/searxng/wiki"
            helpText="Link to wiki or knowledge base"
          />
        </div>
      </ConfigSection>
    );
  };

  /**
   * Render the general settings tab
   */
  private renderGeneralTab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="General Settings" 
        description="Basic instance configuration"
        docLink="https://docs.searxng.org/admin/settings/settings_general.html"
      >
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

        <FormField
          label="Instance Name"
          value={settings.general?.instance_name || ''}
          onChange={(value) => this.updateSetting('general', 'instance_name', value)}
          placeholder="My SearXNG Instance"
          helpText="Display name for your instance"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Privacy Policy URL"
            type="url"
            value={settings.general?.privacypolicy_url || ''}
            onChange={(value) => this.updateSetting('general', 'privacypolicy_url', value || false)}
            placeholder="https://example.com/privacy"
            helpText="Link to privacy policy (optional)"
          />

          <FormField
            label="Donation URL"
            type="url"
            value={settings.general?.donation_url || ''}
            onChange={(value) => this.updateSetting('general', 'donation_url', value || false)}
            placeholder="https://example.com/donate"
            helpText="Link to accept donations (optional)"
          />
        </div>

        <FormField
          label="Contact URL"
          type="url"
          value={settings.general?.contact_url || ''}
          onChange={(value) => this.updateSetting('general', 'contact_url', value || false)}
          placeholder="https://example.com/contact"
          helpText="Contact information link (optional)"
        />
      </ConfigSection>
    );
  };

  /**
   * Render the server settings tab
   */
  private renderServerTab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="Server Settings" 
        description="Network and security configuration"
        docLink="https://docs.searxng.org/admin/settings/settings_server.html"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Port"
            type="number"
            value={settings.server?.port || 8888}
            onChange={(value) => this.updateSetting('server', 'port', parseInt(value) || 8888)}
            helpText="Port to listen on"
            required
          />

          <FormField
            label="Bind Address"
            value={settings.server?.bind_address || '127.0.0.1'}
            onChange={(value) => this.updateSetting('server', 'bind_address', value)}
            helpText="IP address to bind to"
            required
          />
        </div>

        <div className="space-y-2">
          <FormField
            label="Secret Key"
            type="password"
            value={settings.server?.secret_key || ''}
            onChange={(value) => this.updateSetting('server', 'secret_key', value)}
            placeholder="Generate a secure random key"
            helpText={
              <span className="inline-flex items-center gap-1 text-red-600">
                <AlertCircle className="w-3 h-3" />
                IMPORTANT: Change this to a secure random string!
              </span>
            }
            required
          />
          <button
            type="button"
            onClick={this.generateSecretKey}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
          >
            <KeyRound className="w-4 h-4" />
            Generate Random Secret Key
          </button>
        </div>

        <FormField
          label="Base URL"
          type="url"
          value={settings.server?.base_url || ''}
          onChange={(value) => this.updateSetting('server', 'base_url', value || false)}
          placeholder="https://search.example.com"
          helpText="Public URL of your instance (optional)"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="HTTP Protocol Version"
            value={settings.server?.http_protocol_version || '1.0'}
            onChange={(value) => this.updateSetting('server', 'http_protocol_version', value)}
            options={[
              { value: '1.0', label: 'HTTP/1.0' },
              { value: '1.1', label: 'HTTP/1.1' },
              { value: '2', label: 'HTTP/2' }
            ]}
            helpText="HTTP protocol version to use"
          />

          <FormSelect
            label="Request Method"
            value={settings.server?.method || 'POST'}
            onChange={(value) => this.updateSetting('server', 'method', value)}
            options={[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST (More Secure)' }
            ]}
            helpText="HTTP method for search queries"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormCheckbox
            label="Enable Rate Limiter"
            checked={settings.server?.limiter || false}
            onChange={(checked) => this.updateSetting('server', 'limiter', checked)}
            helpText="Block bots and limit requests"
          />

          <FormCheckbox
            label="Enable Image Proxy"
            checked={settings.server?.image_proxy || false}
            onChange={(checked) => this.updateSetting('server', 'image_proxy', checked)}
            helpText="Proxy images for privacy"
          />

          <FormCheckbox
            label="Public Instance"
            checked={settings.server?.public_instance || false}
            onChange={(checked) => this.updateSetting('server', 'public_instance', checked)}
            helpText="Enable public instance features"
          />
        </div>
      </ConfigSection>
    );
  };

  /**
   * Render the search settings tab
   */
  private renderSearchTab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="Search Settings" 
        description="Search behavior and defaults"
        docLink="https://docs.searxng.org/admin/settings/settings_search.html"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Safe Search"
            value={settings.search?.safe_search || 2}
            onChange={(value) => this.updateSetting('search', 'safe_search', parseInt(value.toString()))}
            options={[
              { value: 0, label: 'None - Show all content' },
              { value: 1, label: 'Moderate - Filter explicit content' },
              { value: 2, label: 'Strict - Maximum filtering' }
            ]}
            helpText="Default safe search level"
          />

          <FormField
            label="Autocomplete Engine"
            value={settings.search?.autocomplete || ''}
            onChange={(value) => this.updateSetting('search', 'autocomplete', value)}
            placeholder="duckduckgo"
            helpText="Engine to use for search suggestions"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Default Language"
            value={settings.search?.default_lang || ''}
            onChange={(value) => this.updateSetting('search', 'default_lang', value)}
            placeholder="auto"
            helpText="Default search language (ISO 639-1 code)"
          />

          <FormField
            label="Ban Time on Fail (seconds)"
            type="number"
            value={settings.search?.ban_time_on_fail || 5}
            onChange={(value) => this.updateSetting('search', 'ban_time_on_fail', parseInt(value) || 5)}
            helpText="Time to ban engine on failure"
          />
        </div>

        <FormField
          label="Max Ban Time (seconds)"
          type="number"
          value={settings.search?.max_ban_time_on_fail || 120}
          onChange={(value) => this.updateSetting('search', 'max_ban_time_on_fail', parseInt(value) || 120)}
          helpText="Maximum ban time for failing engines"
        />

        <ListInput
          label="Output Formats"
          items={settings.search?.formats || ['html', 'json']}
          onChange={(items) => this.updateSetting('search', 'formats', items)}
          placeholder="html, json, csv, rss"
          helpText="Supported search result formats"
        />
      </ConfigSection>
    );
  };

  /**
   * Render the UI settings tab
   */
  private renderUITab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="User Interface Settings" 
        description="Theme and display options"
        docLink="https://docs.searxng.org/admin/settings/settings_ui.html"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Default Theme"
            value={settings.ui?.default_theme || 'simple'}
            onChange={(value) => this.updateSetting('ui', 'default_theme', value)}
            options={[
              { value: 'simple', label: 'Simple' },
              { value: 'oscar', label: 'Oscar' },
              { value: 'logicodev', label: 'Logicodev' },
              { value: 'logicodev-dark', label: 'Logicodev Dark' }
            ]}
            helpText="Default user interface theme"
          />

          <FormField
            label="Cache URL"
            type="url"
            value={settings.ui?.cache_url || ''}
            onChange={(value) => this.updateSetting('ui', 'cache_url', value)}
            placeholder="https://web.archive.org/web/"
            helpText="URL for cached page viewing"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Static Path"
            value={settings.ui?.static_path || ''}
            onChange={(value) => this.updateSetting('ui', 'static_path', value)}
            placeholder="/static"
            helpText="Custom static files path"
          />

          <FormField
            label="Templates Path"
            value={settings.ui?.templates_path || ''}
            onChange={(value) => this.updateSetting('ui', 'templates_path', value)}
            placeholder="/templates"
            helpText="Custom templates directory"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FormCheckbox
            label="Static Use Hash"
            checked={settings.ui?.static_use_hash || false}
            onChange={(checked) => this.updateSetting('ui', 'static_use_hash', checked)}
            helpText="Add hash to static file URLs"
          />

          <FormCheckbox
            label="Query in Title"
            checked={settings.ui?.query_in_title || false}
            onChange={(checked) => this.updateSetting('ui', 'query_in_title', checked)}
            helpText="Show search query in page title"
          />

          <FormCheckbox
            label="Infinite Scroll"
            checked={settings.ui?.infinite_scroll || false}
            onChange={(checked) => this.updateSetting('ui', 'infinite_scroll', checked)}
            helpText="Enable infinite scrolling for results"
          />

          <FormCheckbox
            label="Center Alignment"
            checked={settings.ui?.center_alignment || false}
            onChange={(checked) => this.updateSetting('ui', 'center_alignment', checked)}
            helpText="Center-align the search interface"
          />
        </div>
      </ConfigSection>
    );
  };

  /**
   * Render the Redis settings tab
   */
  private renderRedisTab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="Redis Configuration" 
        description="Redis cache and session storage"
        docLink="https://docs.searxng.org/admin/settings/settings_redis.html"
      >
        <FormField
          label="Redis URL"
          value={settings.redis?.url === false ? '' : (settings.redis?.url || '')}
          onChange={(value) => this.updateSetting('redis', 'url', value || false)}
          placeholder="redis://localhost:6379/0"
          helpText="Redis connection URL (leave empty to disable Redis caching)"
        />
      </ConfigSection>
    );
  };

  /**
   * Render the Valkey settings tab
   */
  private renderValkeyTab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="Valkey Configuration" 
        description="Valkey cache and session storage"
        docLink="https://docs.searxng.org/admin/settings/settings_valkey.html"
      >
        <FormField
          label="Valkey URL"
          value={settings.valkey?.url === false ? '' : (settings.valkey?.url || '')}
          onChange={(value) => this.updateSetting('valkey', 'url', value || false)}
          placeholder="valkey://localhost:6379/0"
          helpText="Valkey connection URL (leave empty to disable Valkey caching)"
        />
      </ConfigSection>
    );
  };

  /**
   * Render the outgoing requests settings tab
   */
  private renderOutgoingTab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="Outgoing Requests" 
        description="Network and proxy settings for search engines"
        docLink="https://docs.searxng.org/admin/settings/settings_outgoing.html"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Request Timeout (seconds)"
            type="number"
            step="0.1"
            value={settings.outgoing?.request_timeout || 3.0}
            onChange={(value) => this.updateSetting('outgoing', 'request_timeout', parseFloat(value) || 3.0)}
            helpText="Default timeout for search engine requests"
          />

          <FormField
            label="Max Request Timeout (seconds)"
            type="number"
            step="0.1"
            value={settings.outgoing?.max_request_timeout || 15.0}
            onChange={(value) => this.updateSetting('outgoing', 'max_request_timeout', parseFloat(value) || 15.0)}
            helpText="Maximum allowed timeout value"
          />
        </div>

        <FormField
          label="User Agent Suffix"
          value={settings.outgoing?.useragent_suffix || ''}
          onChange={(value) => this.updateSetting('outgoing', 'useragent_suffix', value)}
          placeholder="MySearchEngine/1.0"
          helpText="Custom suffix for User-Agent header"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            label="Pool Connections"
            type="number"
            value={settings.outgoing?.pool_connections || 100}
            onChange={(value) => this.updateSetting('outgoing', 'pool_connections', parseInt(value) || 100)}
            helpText="Number of connection pools"
          />

          <FormField
            label="Pool Max Size"
            type="number"
            value={settings.outgoing?.pool_maxsize || 20}
            onChange={(value) => this.updateSetting('outgoing', 'pool_maxsize', parseInt(value) || 20)}
            helpText="Maximum connections per pool"
          />

          <FormField
            label="Extra Proxy Timeout"
            type="number"
            value={settings.outgoing?.extra_proxy_timeout || 0}
            onChange={(value) => this.updateSetting('outgoing', 'extra_proxy_timeout', parseInt(value) || 0)}
            helpText="Additional timeout when using proxies"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormCheckbox
            label="Enable HTTP/2"
            checked={settings.outgoing?.enable_http2 ?? true}
            onChange={(checked) => this.updateSetting('outgoing', 'enable_http2', checked)}
            helpText="Use HTTP/2 for outgoing requests"
          />

          <FormCheckbox
            label="Using Tor Proxy"
            checked={settings.outgoing?.using_tor_proxy || false}
            onChange={(checked) => this.updateSetting('outgoing', 'using_tor_proxy', checked)}
            helpText="Route requests through Tor"
          />
        </div>
      </ConfigSection>
    );
  };

  /**
   * Render the categories settings tab
   */
  private renderCategoriesTab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="Categories as Tabs" 
        description="Configure which search categories appear as tabs"
        docLink="https://docs.searxng.org/admin/settings/settings.html#settings-categories-as-tabs"
      >
        <ListInput
          label="Category Tabs"
          items={settings.categories_as_tabs || ['general', 'images', 'videos', 'news', 'map', 'music', 'it', 'science', 'files', 'social media']}
          onChange={(items) => this.updateSetting('categories_as_tabs', null, items)}
          placeholder="general, images, videos, news"
          helpText="Categories that will appear as tabs in the search interface"
        />
      </ConfigSection>
    );
  };

  /**
   * Render the engines settings tab
   */
  private renderEnginesTab = () => {
    const { settings } = this.state;
    
    return (
      <ConfigSection 
        title="Search Engines" 
        description="Configure and manage search engines"
        docLink="https://docs.searxng.org/admin/engines/index.html"
      >
        <EngineEditor
          engines={settings.engines || []}
          onChange={(engines) => this.updateSetting('engines', null, engines)}
        />
      </ConfigSection>
    );
  };

  render() {
    const { activeTab, showYaml, yamlOutput } = this.state;
    const { className = '' } = this.props;

    const tabs: readonly ConfigTab[] = [
      'base', 'brand', 'general', 'server', 'search', 'ui', 
      'redis', 'valkey', 'outgoing', 'categories', 'engines'
    ];

    return (
      <div className={`p-6 ${className}`}>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            SearXNG Settings Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your SearXNG instance with an intuitive form interface
          </p>
        </div>

        <TabNavigation
          activeTab={activeTab}
          tabs={tabs}
          onTabChange={this.setActiveTab}
        />

        <div className="mb-6">
          {activeTab === 'base' && this.renderBaseTab()}
          {activeTab === 'brand' && this.renderBrandTab()}
          {activeTab === 'general' && this.renderGeneralTab()}
          {activeTab === 'server' && this.renderServerTab()}
          {activeTab === 'search' && this.renderSearchTab()}
          {activeTab === 'ui' && this.renderUITab()}
          {activeTab === 'redis' && this.renderRedisTab()}
          {activeTab === 'valkey' && this.renderValkeyTab()}
          {activeTab === 'outgoing' && this.renderOutgoingTab()}
          {activeTab === 'categories' && this.renderCategoriesTab()}
          {activeTab === 'engines' && this.renderEnginesTab()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-6">
          <button
            type="button"
            onClick={this.showYamlOutput}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FileCode className="w-5 h-5" />
            Generate settings.yml
          </button>
        </div>

        <ActionButtons
          primaryActions={[
            CommonActions.download(this.downloadConfig)
          ]}
          secondaryActions={[
            CommonActions.reset(this.resetToDefaults)
          ]}
        />

        {/* YAML Output */}
        {showYaml && yamlOutput && (
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Generated settings.yml
              </h2>
              <button
                type="button"
                onClick={this.downloadConfig}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download settings.yml
              </button>
            </div>
            <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto">
              <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                {yamlOutput}
              </code>
            </pre>
          </div>
        )}
      </div>
    );
  }
}