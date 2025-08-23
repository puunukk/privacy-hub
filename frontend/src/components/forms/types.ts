/**
 * @fileoverview Type definitions for SearXNG configuration components
 * @author Privacy Hub Dashboard
 */

/**
 * Configuration settings for a SearXNG search engine
 */
export interface EngineConfig {
  name: string;
  engine: string;
  shortcut?: string;
  base_url?: string;
  categories?: string[];
  timeout?: number;
  api_key?: string;
  disabled?: boolean;
  language?: string;
  tokens?: string[];
  weight?: number;
  display_error_messages?: boolean;
  enable_http?: boolean;
  using_tor_proxy?: boolean;
}

/**
 * SearXNG general settings configuration
 */
export interface GeneralSettings {
  debug: boolean;
  instance_name: string;
  privacypolicy_url?: string | false;
  donation_url?: string | false;
  contact_url?: string | false;
  enable_metrics: boolean;
}

/**
 * SearXNG brand settings configuration
 */
export interface BrandSettings {
  issue_url?: string;
  docs_url?: string;
  public_instances?: string;
  wiki_url?: string;
}

/**
 * SearXNG search behavior settings
 */
export interface SearchSettings {
  safe_search: 0 | 1 | 2;
  autocomplete: string;
  default_lang: string;
  formats: string[];
  ban_time_on_fail?: number;
  max_ban_time_on_fail?: number;
}

/**
 * SearXNG server configuration settings
 */
export interface ServerSettings {
  port: number;
  bind_address: string;
  secret_key: string;
  base_url?: string | false;
  limiter: boolean;
  image_proxy: boolean;
  http_protocol_version: '1.0' | '1.1' | '2';
  method: 'GET' | 'POST';
  public_instance: boolean;
  default_http_headers?: Record<string, string>;
}

/**
 * SearXNG user interface settings
 */
export interface UISettings {
  static_path?: string;
  static_use_hash: boolean;
  templates_path?: string;
  query_in_title: boolean;
  infinite_scroll: boolean;
  default_theme: 'simple' | 'oscar' | 'logicodev' | 'logicodev-dark';
  center_alignment: boolean;
  cache_url?: string;
}

/**
 * Redis settings
 */
export interface RedisSettings {
  url: string | false;
}

/**
 * Valkey settings
 */
export interface ValkeySettings {
  url: string | false;
}

/**
 * Outgoing request settings
 */
export interface OutgoingSettings {
  request_timeout: number;
  max_request_timeout: number;
  useragent_suffix?: string;
  pool_connections: number;
  pool_maxsize: number;
  enable_http2: boolean;
  proxies?: ProxySettings;
  using_tor_proxy: boolean;
  extra_proxy_timeout?: number;
}

/**
 * Proxy settings
 */
export interface ProxySettings {
  http?: string[];
  https?: string[];
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  active: boolean;
  [key: string]: any;
}

/**
 * Complete SearXNG settings configuration
 */
export interface SearXngSettings {
  use_default_settings: boolean;
  general?: GeneralSettings;
  brand?: BrandSettings;
  search?: SearchSettings;
  server?: ServerSettings;
  ui?: UISettings;
  redis?: RedisSettings;
  valkey?: ValkeySettings;
  outgoing?: OutgoingSettings;
  categories_as_tabs?: string[];
  engines?: EngineConfig[];
  plugins?: Record<string, PluginConfig>;
}

/**
 * Available configuration tabs
 */
export type ConfigTab = 'base' | 'brand' | 'general' | 'server' | 'search' | 'ui' | 'redis' | 'valkey' | 'outgoing' | 'categories' | 'engines';

/**
 * Form field option for select inputs
 */
export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Display label */
  label: string;
}