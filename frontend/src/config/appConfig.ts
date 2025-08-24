/**
 * @fileoverview Application configuration management for state loops and settings
 * @author Privacy Hub Dashboard
 */

import { Component } from 'react';

/**
 * Configuration for polling intervals and state management
 */
export interface AppConfig {
  /** Polling intervals in milliseconds */
  polling: {
    /** System metrics polling interval */
    metrics: number;
    /** Docker container status polling interval */
    containers: number;
    /** Service health check interval */
    heartbeat: number;
    /** Network status check interval */
    network: number;
  };
  /** API configuration */
  api: {
    /** Request timeout in milliseconds */
    timeout: number;
    /** Number of retry attempts */
    retries: number;
    /** Base URLs for different services */
    endpoints: {
      backend: string;
      docker: string;
      pihole: string;
      searxng: string;
    };
  };
  /** UI behavior settings */
  ui: {
    /** Notification auto-dismiss time */
    notificationTimeout: number;
    /** Animation durations */
    animations: {
      fast: number;
      medium: number;
      slow: number;
    };
    /** Theme settings */
    theme: {
      default: 'light' | 'dark' | 'auto';
      storageKey: string;
    };
  };
  /** Development mode settings */
  dev: {
    /** Enable debug logging */
    debug: boolean;
    /** Mock API responses */
    mockApi: boolean;
    /** Extended error information */
    verboseErrors: boolean;
  };
}

/**
 * Default application configuration
 */
export const defaultConfig: AppConfig = {
  polling: {
    metrics: 5000,    // 5 seconds
    containers: 10000, // 10 seconds
    heartbeat: 1000,   // 1 second
    network: 30000     // 30 seconds
  },
  api: {
    timeout: 10000,    // 10 seconds
    retries: 3,
    endpoints: {
      backend: '/pi-system',
      docker: '/docker-api',
      pihole: '/pi-hole',
      searxng: '/'
    }
  },
  ui: {
    notificationTimeout: 5000, // 5 seconds
    animations: {
      fast: 150,
      medium: 300,
      slow: 500
    },
    theme: {
      default: 'auto',
      storageKey: 'ph-theme'
    }
  },
  dev: {
    debug: process.env.NODE_ENV === 'development',
    mockApi: false,
    verboseErrors: process.env.NODE_ENV === 'development'
  }
};

/**
 * Environment-specific configuration overrides
 */
const environmentConfig: Partial<AppConfig> = {
  ...(process.env.NODE_ENV === 'development' && {
    polling: {
      metrics: 3000,    // Faster polling in dev
      containers: 5000,
      heartbeat: 500,
      network: 15000
    },
    dev: {
      debug: true,
      mockApi: false,
      verboseErrors: true
    }
  }),
  ...(process.env.NODE_ENV === 'production' && {
    polling: {
      metrics: 10000,   // Slower polling in production
      containers: 15000,
      heartbeat: 2000,
      network: 60000
    },
    dev: {
      debug: false,
      mockApi: false,
      verboseErrors: false
    }
  })
};

/**
 * Configuration manager class for runtime configuration changes
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;
  private listeners: Array<(config: AppConfig) => void> = [];

  private constructor() {
    this.config = this.mergeConfigs(defaultConfig, environmentConfig);
    this.loadFromStorage();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get current configuration
   */
  public getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<AppConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Reset configuration to defaults
   */
  public resetConfig(): void {
    this.config = this.mergeConfigs(defaultConfig, environmentConfig);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to configuration changes
   */
  public subscribe(listener: (config: AppConfig) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Update polling intervals
   */
  public updatePolling(polling: Partial<AppConfig['polling']>): void {
    this.updateConfig({
      polling: { ...this.config.polling, ...polling }
    });
  }

  /**
   * Update API configuration
   */
  public updateApi(api: Partial<AppConfig['api']>): void {
    this.updateConfig({
      api: { ...this.config.api, ...api }
    });
  }

  /**
   * Enable/disable debug mode
   */
  public setDebugMode(enabled: boolean): void {
    this.updateConfig({
      dev: { ...this.config.dev, debug: enabled }
    });
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfigs(base: AppConfig, override: Partial<AppConfig>): AppConfig {
    const merged = { ...base };
    
    for (const [key, value] of Object.entries(override)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        merged[key as keyof AppConfig] = {
          ...merged[key as keyof AppConfig],
          ...value
        } as any;
      } else if (value !== undefined) {
        merged[key as keyof AppConfig] = value as any;
      }
    }
    
    return merged;
  }

  /**
   * Save configuration to localStorage
   */
  private saveToStorage(): void {
    try {
      const configToSave = {
        polling: this.config.polling,
        ui: this.config.ui,
        // Don't save API endpoints or dev settings
      };
      localStorage.setItem('ph-config', JSON.stringify(configToSave));
    } catch (error) {
      console.warn('Failed to save configuration to localStorage:', error);
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('ph-config');
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        this.config = this.mergeConfigs(this.config, parsedConfig);
      }
    } catch (error) {
      console.warn('Failed to load configuration from localStorage:', error);
    }
  }

  /**
   * Notify all listeners of configuration changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getConfig());
      } catch (error) {
        console.error('Configuration listener error:', error);
      }
    });
  }
}

/**
 * Base class component for using configuration
 */
interface AppConfigComponentState {
  config: AppConfig;
}

export abstract class AppConfigComponent<P = {}, S extends AppConfigComponentState = AppConfigComponentState> 
  extends Component<P, S> {
  private configUnsubscribe?: () => void;

  constructor(props: P) {
    super(props);
    this.state = {
      config: ConfigManager.getInstance().getConfig()
    } as S;
  }

  componentDidMount() {
    const configManager = ConfigManager.getInstance();
    this.configUnsubscribe = configManager.subscribe(this.handleConfigChange);
  }

  componentWillUnmount() {
    if (this.configUnsubscribe) {
      this.configUnsubscribe();
    }
  }

  private handleConfigChange = (config: AppConfig) => {
    this.setState({ config } as Pick<S, keyof S>);
  }

  protected updateConfig = (updates: Partial<AppConfig>) => {
    ConfigManager.getInstance().updateConfig(updates);
  }

  protected updatePolling = (polling: Partial<AppConfig['polling']>) => {
    ConfigManager.getInstance().updatePolling(polling);
  }

  protected resetConfig = () => {
    ConfigManager.getInstance().resetConfig();
  }
}

// Export singleton instance for use in class components
export const configManager = ConfigManager.getInstance();