import React, { Component, PureComponent, ChangeEvent } from 'react';
import {
    Info,
    BookOpen,
    ChevronDown,
    ChevronRight,
    KeyRound,
    Download,
    AlertCircle,
    FileCode,
    Plus,
    X,
    Trash2
} from 'lucide-react';

// =============== UTILITY FUNCTIONS ===============
const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
    return classes.filter(Boolean).join(' ');
};

// =============== TYPE DEFINITIONS ===============
interface SearXNGSettings {
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

interface GeneralSettings {
    debug: boolean;
    instance_name: string;
    privacypolicy_url?: string | false;
    donation_url?: string | false;
    contact_url?: string | false;
    enable_metrics: boolean;
}

interface BrandSettings {
    issue_url?: string;
    docs_url?: string;
    public_instances?: string;
    wiki_url?: string;
}

interface SearchSettings {
    safe_search: 0 | 1 | 2;
    autocomplete: string;
    default_lang: string;
    formats: string[];
    ban_time_on_fail?: number;
    max_ban_time_on_fail?: number;
}

interface ServerSettings {
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

interface UISettings {
    static_path?: string;
    static_use_hash: boolean;
    templates_path?: string;
    query_in_title: boolean;
    infinite_scroll: boolean;
    default_theme: 'simple' | 'oscar' | 'logicodev' | 'logicodev-dark';
    center_alignment: boolean;
    cache_url?: string;
}

interface RedisSettings {
    url: string | false;
}

interface ValkeySettings {
    url: string | false;
}

interface OutgoingSettings {
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

interface ProxySettings {
    http?: string[];
    https?: string[];
}

interface EngineConfig {
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

interface PluginConfig {
    active: boolean;
    [key: string]: any;
}

// =============== BASE FORM COMPONENTS ===============

// Info Icon Component
interface InfoIconProps {
    tooltip: string;
    docLink?: string;
}

class InfoIcon extends PureComponent<InfoIconProps> {
    state = {
        showTooltip: false
    };

    handleMouseEnter = () => {
        this.setState({ showTooltip: true });
    };

    handleMouseLeave = () => {
        this.setState({ showTooltip: false });
    };

    render() {
        const { tooltip, docLink } = this.props;
        const { showTooltip } = this.state;

        return (
            <div className="relative inline-block ml-2">
                <span
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
                    className="inline-flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors cursor-help"
                    title={tooltip}
                >
                    <Info size={14} />
                </span>
                {showTooltip && (
                    <div className="absolute z-10 w-64 p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg -top-2 left-6">
                        <div className="text-xs leading-relaxed">{tooltip}</div>
                        {docLink && (
                            <a
                                href={docLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-500 hover:text-blue-600"
                            >
                                <BookOpen size={10} />
                                Read documentation
                            </a>
                        )}
                        <div className="absolute w-2 h-2 bg-white border-l border-b border-gray-200 transform rotate-45 -left-1 top-3"></div>
                    </div>
                )}
            </div>
        );
    }
}

interface BaseInputProps {
    id: string;
    label: string;
    value: string | number | boolean;
    onChange: (value: any) => void;
    placeholder?: string;
    helpText?: string | React.ReactNode;
    tooltip?: string;
    docLink?: string;
    required?: boolean;
    className?: string;
}

class TextInput extends PureComponent<BaseInputProps & { type?: 'text' | 'number' | 'password' | 'url' }> {
    handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { type = 'text', onChange } = this.props;
        const value = type === 'number' ? Number(e.target.value) : e.target.value;
        onChange(value);
    };

    render() {
        const { id, label, value, type = 'text', placeholder, helpText, tooltip, docLink, required, className } = this.props;

        const inputClasses = classNames(
            'w-full px-4 py-2 border rounded-lg',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'border-gray-300 dark:border-gray-600',
            'transition-colors duration-200',
            className
        );

        return (
            <div className="mb-4">
                <label htmlFor={id} className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    {tooltip && <InfoIcon tooltip={tooltip} docLink={docLink} />}
                </label>
                <input
                    id={id}
                    type={type}
                    value={value as string | number}
                    onChange={this.handleChange}
                    placeholder={placeholder}
                    required={required}
                    className={inputClasses}
                />
                {helpText && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</div>
                )}
            </div>
        );
    }
}

class SelectInput extends PureComponent<BaseInputProps & { options: Array<{ value: any; label: string }> }> {
    handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { onChange } = this.props;
        onChange(e.target.value);
    };

    render() {
        const { id, label, value, options, helpText, tooltip, docLink, required, className } = this.props;

        const selectClasses = classNames(
            'w-full px-4 py-2 border rounded-lg',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'border-gray-300 dark:border-gray-600',
            'transition-colors duration-200',
            className
        );

        return (
            <div className="mb-4">
                <label htmlFor={id} className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    {tooltip && <InfoIcon tooltip={tooltip} docLink={docLink} />}
                </label>
                <select
                    id={id}
                    value={value as string | number}
                    onChange={this.handleChange}
                    required={required}
                    className={selectClasses}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {helpText && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</div>
                )}
            </div>
        );
    }
}

class CheckboxInput extends PureComponent<BaseInputProps> {
    handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.props.onChange(e.target.checked);
    };

    render() {
        const { id, label, value, helpText, tooltip, docLink, className } = this.props;

        const containerClasses = classNames(
            'mb-4 flex items-start',
            className
        );

        return (
            <div className={containerClasses}>
                <input
                    id={id}
                    type="checkbox"
                    checked={value as boolean}
                    onChange={this.handleChange}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                    <label htmlFor={id} className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        <span>{label}</span>
                        {tooltip && <InfoIcon tooltip={tooltip} docLink={docLink} />}
                    </label>
                    {helpText && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</div>
                    )}
                </div>
            </div>
        );
    }
}

interface ListInputProps {
    id: string;
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    helpText?: string | React.ReactNode;
    tooltip?: string;
    docLink?: string;
}

class ListInput extends Component<ListInputProps> {
    state = {
        newItem: ''
    };

    handleAddItem = () => {
        const { newItem } = this.state;
        const { items, onChange } = this.props;

        if (newItem.trim()) {
            onChange([...items, newItem.trim()]);
            this.setState({ newItem: '' });
        }
    };

    handleRemoveItem = (index: number) => {
        const { items, onChange } = this.props;
        onChange(items.filter((_, i) => i !== index));
    };

    handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleAddItem();
        }
    };

    render() {
        const { id, label, items, placeholder, helpText, tooltip, docLink } = this.props;
        const { newItem } = this.state;

        return (
            <div className="mb-4">
                <label htmlFor={id} className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>{label}</span>
                    {tooltip && <InfoIcon tooltip={tooltip} docLink={docLink} />}
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        id={id}
                        type="text"
                        value={newItem}
                        onChange={(e) => this.setState({ newItem: e.target.value })}
                        onKeyPress={this.handleKeyPress}
                        placeholder={placeholder}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                    <button
                        type="button"
                        onClick={this.handleAddItem}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>
                {items.length > 0 && (
                    <div className="space-y-1">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item}</span>
                                <button
                                    type="button"
                                    onClick={() => this.handleRemoveItem(index)}
                                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm"
                                >
                                    <X size={14} />
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {helpText && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</div>
                )}
            </div>
        );
    }
}

// =============== SECTION COMPONENTS ===============

interface SectionProps {
    title: string;
    description?: string;
    docLink?: string;
    children: React.ReactNode;
    isCollapsible?: boolean;
}

interface SectionState {
    isCollapsed: boolean;
}

class FormSection extends Component<SectionProps, SectionState> {
    state: SectionState = {
        isCollapsed: false
    };

    toggleCollapse = () => {
        this.setState(prevState => ({ isCollapsed: !prevState.isCollapsed }));
    };

    render() {
        const { title, description, docLink, children, isCollapsible = true } = this.props;
        const { isCollapsed } = this.state;

        const sectionClasses = classNames(
            'mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm',
            'border border-gray-200 dark:border-gray-700'
        );

        return (
            <div className={sectionClasses}>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isCollapsible && (
                            <button
                                type="button"
                                onClick={this.toggleCollapse}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                            </button>
                        )}
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            {title}
                        </h2>
                        {docLink && (
                            <a
                                href={docLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                            >
                                <BookOpen size={16} />
                                Documentation
                            </a>
                        )}
                    </div>
                </div>
                {description && (
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{description}</p>
                )}
                {!isCollapsed && children}
            </div>
        );
    }
}

// =============== ENGINE EDITOR COMPONENT ===============

interface EngineEditorProps {
    engines: EngineConfig[];
    onChange: (engines: EngineConfig[]) => void;
}

interface EngineEditorState {
    editingIndex: number | null;
    newEngine: EngineConfig;
}

class EngineEditor extends Component<EngineEditorProps, EngineEditorState> {
    state: EngineEditorState = {
        editingIndex: null,
        newEngine: {
            name: '',
            engine: '',
            shortcut: '',
            disabled: false,
            categories: [],
            timeout: 3.0,
            weight: 1
        }
    };

    handleAddEngine = () => {
        const { engines, onChange } = this.props;
        const { newEngine } = this.state;

        if (newEngine.name && newEngine.engine) {
            onChange([...engines, newEngine]);
            this.setState({
                newEngine: {
                    name: '',
                    engine: '',
                    shortcut: '',
                    disabled: false,
                    categories: [],
                    timeout: 3.0,
                    weight: 1
                }
            });
        }
    };

    handleRemoveEngine = (index: number) => {
        const { engines, onChange } = this.props;
        onChange(engines.filter((_, i) => i !== index));
    };

    handleToggleEngine = (index: number) => {
        const { engines, onChange } = this.props;
        const updated = [...engines];
        updated[index] = { ...updated[index], disabled: !updated[index].disabled };
        onChange(updated);
    };

    updateNewEngine = (field: keyof EngineConfig, value: any) => {
        this.setState(prevState => ({
            newEngine: { ...prevState.newEngine, [field]: value }
        }));
    };

    render() {
        const { engines } = this.props;
        const { newEngine } = this.state;

        return (
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Add New Engine</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput
                            id="engine-name"
                            label="Engine Name"
                            value={newEngine.name}
                            onChange={(value) => this.updateNewEngine('name', value)}
                            placeholder="e.g., google"
                            required
                        />
                        <TextInput
                            id="engine-type"
                            label="Engine Type"
                            value={newEngine.engine}
                            onChange={(value) => this.updateNewEngine('engine', value)}
                            placeholder="e.g., google"
                            required
                        />
                        <TextInput
                            id="engine-shortcut"
                            label="Shortcut"
                            value={newEngine.shortcut || ''}
                            onChange={(value) => this.updateNewEngine('shortcut', value)}
                            placeholder="e.g., !g"
                        />
                        <TextInput
                            id="engine-timeout"
                            label="Timeout (seconds)"
                            type="number"
                            value={newEngine.timeout || 3.0}
                            onChange={(value) => this.updateNewEngine('timeout', value)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={this.handleAddEngine}
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Plus size={16} />
                        Add Engine
                    </button>
                </div>

                {engines.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">Configured Engines</h3>
                        {engines.map((engine, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={!engine.disabled}
                                        onChange={() => this.handleToggleEngine(index)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{engine.name}</span>
                                        {engine.shortcut && (
                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({engine.shortcut})</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => this.handleRemoveEngine(index)}
                                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-600"
                                >
                                    <Trash2 size={16} />
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

// =============== MAIN FORM COMPONENT ===============

interface FormState {
    settings: SearXNGSettings;
    yamlOutput: string;
    showYaml: boolean;
}

class SearXNGSettingsForm extends Component<{}, FormState> {
    state: FormState = {
        settings: {
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
        },
        yamlOutput: '',
        showYaml: false
    };

    updateSetting = (section: keyof SearXNGSettings, field: string | null, value: any) => {
        this.setState(prevState => {
            const newSettings = { ...prevState.settings };

            if (field === null) {
                // Direct assignment for arrays and simple values
                (newSettings as any)[section] = value;
            } else if (typeof newSettings[section] === 'object' && newSettings[section] !== null) {
                // Update nested object
                (newSettings as any)[section] = {
                    ...(newSettings as any)[section],
                    [field]: value
                };
            }

            return { settings: newSettings };
        });
    };

    generateSecretKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let key = '';
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.updateSetting('server', 'secret_key', key);
    };

    generateYAML = () => {
        const { settings } = this.state;

        // Simple YAML generator (in production, use a proper YAML library)
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

        const yaml = toYAML(settings);
        this.setState({ yamlOutput: yaml, showYaml: true });
    };

    downloadYAML = () => {
        const { yamlOutput } = this.state;
        const blob = new Blob([yamlOutput], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'settings.yml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    render() {
        const { settings, yamlOutput, showYaml } = this.state;

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            SearXNG Settings Configuration
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Configure your SearXNG instance with an intuitive form interface
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Use Default Settings */}
                        <FormSection
                            title="Base Configuration"
                            description="Core settings for your SearXNG instance"
                            docLink="https://docs.searxng.org/admin/settings/settings.html#settings-use-default-settings"
                        >
                            <CheckboxInput
                                id="use-default"
                                label="Use Default Settings"
                                value={settings.use_default_settings}
                                onChange={(value) => this.updateSetting('use_default_settings', null, value)}
                                helpText="When enabled, your custom settings will extend the default configuration"
                                tooltip="When enabled, your settings.yml will only need to contain the settings you want to override. The default SearXNG settings will be used as a base. This is the recommended approach as it makes upgrades easier."
                            />
                        </FormSection>

                        {/* Brand Settings */}
                        <FormSection
                            title="Brand Settings"
                            description="Branding and external links"
                            docLink="https://docs.searxng.org/admin/settings/settings_brand.html"
                        >
                            <TextInput
                                id="issue-url"
                                label="Issue Tracker URL"
                                type="url"
                                value={settings.brand?.issue_url || ''}
                                onChange={(value) => this.updateSetting('brand', 'issue_url', value)}
                                placeholder="https://github.com/yourusername/searxng/issues"
                                tooltip="Link to your instance's issue tracker where users can report problems. Typically a GitHub issues page."
                            />
                            <TextInput
                                id="docs-url"
                                label="Documentation URL"
                                type="url"
                                value={settings.brand?.docs_url || ''}
                                onChange={(value) => this.updateSetting('brand', 'docs_url', value)}
                                placeholder="https://docs.searxng.org"
                                tooltip="Link to documentation for your SearXNG instance. Can be the official docs or your custom documentation."
                            />
                            <TextInput
                                id="public-instances"
                                label="Public Instances URL"
                                type="url"
                                value={settings.brand?.public_instances || ''}
                                onChange={(value) => this.updateSetting('brand', 'public_instances', value)}
                                placeholder="https://searx.space"
                                tooltip="Link to a list of public SearXNG instances. Usually points to searx.space or your own curated list."
                            />
                            <TextInput
                                id="wiki-url"
                                label="Wiki URL"
                                type="url"
                                value={settings.brand?.wiki_url || ''}
                                onChange={(value) => this.updateSetting('brand', 'wiki_url', value)}
                                placeholder="https://github.com/searxng/searxng/wiki"
                                tooltip="Link to a wiki or knowledge base for your instance. Can provide guides, FAQs, and community content."
                            />
                        </FormSection>

                        {/* General Settings */}
                        <FormSection
                            title="General Settings"
                            description="Basic instance configuration"
                            docLink="https://docs.searxng.org/admin/settings/settings_general.html"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <CheckboxInput
                                    id="debug"
                                    label="Debug Mode"
                                    value={settings.general?.debug || false}
                                    onChange={(value) => this.updateSetting('general', 'debug', value)}
                                    helpText="Enable detailed logging (disable in production)"
                                    tooltip="Enables verbose logging output and detailed error messages in the browser. This should ALWAYS be disabled in production environments for security reasons."
                                />
                                <CheckboxInput
                                    id="enable-metrics"
                                    label="Enable Metrics"
                                    value={settings.general?.enable_metrics ?? true}
                                    onChange={(value) => this.updateSetting('general', 'enable_metrics', value)}
                                    helpText="Collect anonymous usage statistics"
                                    tooltip="Allows SearXNG to collect anonymous metrics about search queries, response times, and engine performance. This data helps improve the service but can be disabled for privacy."
                                />
                            </div>
                            <TextInput
                                id="instance-name"
                                label="Instance Name"
                                value={settings.general?.instance_name || ''}
                                onChange={(value) => this.updateSetting('general', 'instance_name', value)}
                                placeholder="My SearXNG Instance"
                                helpText="Display name for your instance"
                                tooltip="The name that will be displayed in the browser title and on the main page of your SearXNG instance. This helps users identify your instance."
                            />
                            <TextInput
                                id="privacy-url"
                                label="Privacy Policy URL"
                                type="url"
                                value={settings.general?.privacypolicy_url || ''}
                                onChange={(value) => this.updateSetting('general', 'privacypolicy_url', value || false)}
                                placeholder="https://example.com/privacy"
                                tooltip="Link to your privacy policy page. If provided, a link will be shown in the footer. Leave empty to disable."
                            />
                            <TextInput
                                id="donation-url"
                                label="Donation URL"
                                type="url"
                                value={settings.general?.donation_url || ''}
                                onChange={(value) => this.updateSetting('general', 'donation_url', value || false)}
                                placeholder="https://example.com/donate"
                                tooltip="Link to accept donations for running the instance. If provided, a donation link will be shown in the UI."
                            />
                        </FormSection>

                        {/* Server Settings */}
                        <FormSection
                            title="Server Settings"
                            description="Network and security configuration"
                            docLink="https://docs.searxng.org/admin/settings/settings_server.html"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <TextInput
                                    id="port"
                                    label="Port"
                                    type="number"
                                    value={settings.server?.port || 8888}
                                    onChange={(value) => this.updateSetting('server', 'port', value)}
                                    helpText="Port to listen on"
                                    tooltip="The network port where SearXNG will listen for incoming connections. Default is 8888. Make sure this port is not already in use."
                                    required
                                />
                                <TextInput
                                    id="bind-address"
                                    label="Bind Address"
                                    value={settings.server?.bind_address || '127.0.0.1'}
                                    onChange={(value) => this.updateSetting('server', 'bind_address', value)}
                                    helpText="IP address to bind to"
                                    tooltip="The IP address SearXNG will bind to. Use 127.0.0.1 for localhost only (most secure), or 0.0.0.0 to allow connections from any network interface."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <TextInput
                                    id="secret-key"
                                    label="Secret Key"
                                    type="password"
                                    value={settings.server?.secret_key || ''}
                                    onChange={(value) => this.updateSetting('server', 'secret_key', value)}
                                    placeholder="Generate a secure random key"
                                    helpText={
                                        <span className="inline-flex items-center gap-1 text-red-600">
                                            <AlertCircle size={12} />
                                            IMPORTANT: Change this to a secure random string!
                                        </span>
                                    }
                                    tooltip="A secret key used for cryptographic operations like signing cookies. MUST be changed from default! Generate a long random string (32+ characters) for production use."
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={this.generateSecretKey}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
                                >
                                    <KeyRound size={16} />
                                    Generate Random Secret Key
                                </button>
                            </div>

                            <TextInput
                                id="base-url"
                                label="Base URL"
                                type="url"
                                value={settings.server?.base_url || ''}
                                onChange={(value) => this.updateSetting('server', 'base_url', value || false)}
                                placeholder="https://search.example.com"
                                helpText="Public URL of your instance (optional)"
                                tooltip="The public URL where your instance is accessible. Required if running behind a reverse proxy or if you want proper URLs in results. Leave empty for local-only instances."
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <SelectInput
                                    id="http-version"
                                    label="HTTP Protocol Version"
                                    value={settings.server?.http_protocol_version || '1.0'}
                                    onChange={(value) => this.updateSetting('server', 'http_protocol_version', value)}
                                    options={[
                                        { value: '1.0', label: 'HTTP/1.0' },
                                        { value: '1.1', label: 'HTTP/1.1' },
                                        { value: '2', label: 'HTTP/2' }
                                    ]}
                                    tooltip="HTTP protocol version to use. HTTP/2 offers better performance but may require additional setup. HTTP/1.1 is recommended for most setups."
                                />
                                <SelectInput
                                    id="method"
                                    label="Request Method"
                                    value={settings.server?.method || 'POST'}
                                    onChange={(value) => this.updateSetting('server', 'method', value)}
                                    options={[
                                        { value: 'GET', label: 'GET' },
                                        { value: 'POST', label: 'POST (More Secure)' }
                                    ]}
                                    tooltip="HTTP method for search queries. POST is more secure as queries don't appear in server logs or browser history, but may cause issues with Firefox containers."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <CheckboxInput
                                    id="limiter"
                                    label="Enable Rate Limiter"
                                    value={settings.server?.limiter || false}
                                    onChange={(value) => this.updateSetting('server', 'limiter', value)}
                                    helpText="Block bots and limit requests"
                                    tooltip="Enables rate limiting to prevent abuse and bot traffic. Recommended for public instances to prevent overwhelming the server."
                                />
                                <CheckboxInput
                                    id="image-proxy"
                                    label="Enable Image Proxy"
                                    value={settings.server?.image_proxy || false}
                                    onChange={(value) => this.updateSetting('server', 'image_proxy', value)}
                                    helpText="Proxy images for privacy"
                                    tooltip="Routes all image results through your server to hide user IP addresses from external servers. Increases privacy but uses more bandwidth."
                                />
                                <CheckboxInput
                                    id="public-instance"
                                    label="Public Instance"
                                    value={settings.server?.public_instance || false}
                                    onChange={(value) => this.updateSetting('server', 'public_instance', value)}
                                    helpText="Enable public instance features"
                                    tooltip="Enables features designed for public instances like instance statistics and listing on searx.space. Only enable if your instance is publicly accessible."
                                />
                            </div>
                        </FormSection>

                        {/* Search Settings */}
                        <FormSection
                            title="Search Settings"
                            description="Configure search behavior and defaults"
                            docLink="https://docs.searxng.org/admin/settings/settings_search.html"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <SelectInput
                                    id="safe-search"
                                    label="Safe Search"
                                    value={settings.search?.safe_search || 0}
                                    onChange={(value) => this.updateSetting('search', 'safe_search', Number(value))}
                                    options={[
                                        { value: 0, label: 'Off' },
                                        { value: 1, label: 'Moderate' },
                                        { value: 2, label: 'Strict' }
                                    ]}
                                    helpText="Filter adult content"
                                    tooltip="Controls filtering of adult/NSFW content. Off: No filtering. Moderate: Filters explicit content. Strict: Aggressive filtering of any potentially inappropriate content."
                                />
                                <TextInput
                                    id="autocomplete"
                                    label="Autocomplete Provider"
                                    value={settings.search?.autocomplete || ''}
                                    onChange={(value) => this.updateSetting('search', 'autocomplete', value)}
                                    placeholder="duckduckgo, google, etc."
                                    helpText="Search suggestions provider"
                                    tooltip="The search engine to use for autocomplete suggestions. Options include: duckduckgo, google, startpage, swisscows, qwant, wikipedia. Leave empty to disable autocomplete."
                                />
                            </div>

                            <TextInput
                                id="default-lang"
                                label="Default Language"
                                value={settings.search?.default_lang || ''}
                                onChange={(value) => this.updateSetting('search', 'default_lang', value)}
                                placeholder="en, de, fr, etc."
                                helpText="ISO language code (leave empty for auto-detect)"
                                tooltip="Default language for search results. Use ISO 639-1 codes (en, de, fr, es, etc.). Leave empty to auto-detect from browser settings."
                            />

                            <ListInput
                                id="formats"
                                label="Output Formats"
                                items={settings.search?.formats || ['html', 'json']}
                                onChange={(value) => this.updateSetting('search', 'formats', value)}
                                placeholder="html, json, csv, rss"
                                helpText="Supported output formats"
                                tooltip="Output formats that users can choose from. HTML is required for web interface. JSON is useful for API access. CSV and RSS provide data export options."
                                docLink="https://docs.searxng.org/admin/settings/settings_search.html#search-formats"
                            />
                        </FormSection>

                        {/* UI Settings */}
                        <FormSection
                            title="UI Settings"
                            description="User interface configuration"
                            docLink="https://docs.searxng.org/admin/settings/settings_ui.html"
                        >
                            <SelectInput
                                id="theme"
                                label="Default Theme"
                                value={settings.ui?.default_theme || 'simple'}
                                onChange={(value) => this.updateSetting('ui', 'default_theme', value)}
                                options={[
                                    { value: 'simple', label: 'Simple' },
                                    { value: 'oscar', label: 'Oscar' },
                                    { value: 'logicodev', label: 'LogicoDev' },
                                    { value: 'logicodev-dark', label: 'LogicoDev Dark' }
                                ]}
                                tooltip="The default visual theme for your instance. Simple is clean and minimalist. Oscar provides more features. LogicoDev offers a modern look with light/dark variants."
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <CheckboxInput
                                    id="query-title"
                                    label="Query in Title"
                                    value={settings.ui?.query_in_title || false}
                                    onChange={(value) => this.updateSetting('ui', 'query_in_title', value)}
                                    helpText="Show search query in page title"
                                    tooltip="When enabled, the search query will be shown in the browser tab title. This can be a privacy concern as browsers may record page titles in history."
                                />
                                <CheckboxInput
                                    id="infinite-scroll"
                                    label="Infinite Scroll"
                                    value={settings.ui?.infinite_scroll || false}
                                    onChange={(value) => this.updateSetting('ui', 'infinite_scroll', value)}
                                    helpText="Auto-load next page"
                                    tooltip="Automatically loads the next page of results when scrolling to the bottom, providing a seamless browsing experience without clicking 'Next'."
                                />
                                <CheckboxInput
                                    id="center-align"
                                    label="Center Alignment"
                                    value={settings.ui?.center_alignment || false}
                                    onChange={(value) => this.updateSetting('ui', 'center_alignment', value)}
                                    helpText="Center search results"
                                    tooltip="Centers the search results on the page instead of left-aligning them. This can improve readability on wide screens."
                                />
                            </div>
                        </FormSection>

                        {/* Redis Settings */}
                        <FormSection
                            title="Redis Settings"
                            description="Cache and session storage"
                            docLink="https://docs.searxng.org/admin/settings/settings_redis.html"
                        >
                            <TextInput
                                id="redis-url"
                                label="Redis URL"
                                value={settings.redis?.url || ''}
                                onChange={(value) => this.updateSetting('redis', 'url', value || false)}
                                placeholder="redis://redis:6379/0"
                                helpText="Connection URL for Redis (leave empty to disable)"
                                tooltip="Redis is used for caching search results and rate limiting. Format: redis://[username:password@]host:port/db_number. Leave empty if you don't have Redis installed."
                            />
                        </FormSection>

                        {/* Valkey Settings */}
                        <FormSection
                            title="Valkey Settings"
                            description="Alternative to Redis for cache and session storage"
                            docLink="https://docs.searxng.org/admin/settings/settings_valkey.html"
                        >
                            <TextInput
                                id="valkey-url"
                                label="Valkey URL"
                                value={settings.valkey?.url || ''}
                                onChange={(value) => this.updateSetting('valkey', 'url', value || false)}
                                placeholder="valkey://valkey:6379/0"
                                helpText="Connection URL for Valkey (Redis alternative)"
                                tooltip="Valkey is a Redis-compatible fork that can be used as a drop-in replacement for Redis. Use the same URL format as Redis. If both Redis and Valkey are configured, Redis takes precedence."
                            />
                        </FormSection>

                        {/* Valkey Settings */}
                        <FormSection
                            title="Valkey Settings"
                            description="Alternative to Redis for cache and session storage"
                            docLink="https://docs.searxng.org/admin/settings/settings_valkey.html"
                        >
                            <TextInput
                                id="valkey-url"
                                label="Valkey URL"
                                value={settings.valkey?.url || ''}
                                onChange={(value) => this.updateSetting('valkey', 'url', value || false)}
                                placeholder="valkey://valkey:6379/0"
                                helpText="Connection URL for Valkey (Redis alternative)"
                                tooltip="Valkey is a Redis-compatible fork that can be used as a drop-in replacement for Redis. Use the same URL format as Redis. If both Redis and Valkey are configured, Redis takes precedence."
                            />
                        </FormSection>

                        {/* Outgoing Settings */}
                        <FormSection
                            title="Outgoing Requests"
                            description="Configure how SearXNG connects to search engines"
                            docLink="https://docs.searxng.org/admin/settings/settings_outgoing.html"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <TextInput
                                    id="request-timeout"
                                    label="Request Timeout (seconds)"
                                    type="number"
                                    value={settings.outgoing?.request_timeout || 3.0}
                                    onChange={(value) => this.updateSetting('outgoing', 'request_timeout', value)}
                                    tooltip="Default timeout for search engine requests. Shorter timeouts mean faster results but may miss slow engines."
                                />
                                <TextInput
                                    id="max-request-timeout"
                                    label="Max Request Timeout (seconds)"
                                    type="number"
                                    value={settings.outgoing?.max_request_timeout || 15.0}
                                    onChange={(value) => this.updateSetting('outgoing', 'max_request_timeout', value)}
                                    tooltip="Maximum allowed timeout for any search engine. Prevents extremely slow engines from blocking results."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <TextInput
                                    id="pool-connections"
                                    label="Pool Connections"
                                    type="number"
                                    value={settings.outgoing?.pool_connections || 100}
                                    onChange={(value) => this.updateSetting('outgoing', 'pool_connections', value)}
                                    tooltip="Number of connection pools to maintain. Higher values allow more concurrent searches but use more resources."
                                />
                                <TextInput
                                    id="pool-maxsize"
                                    label="Pool Max Size"
                                    type="number"
                                    value={settings.outgoing?.pool_maxsize || 20}
                                    onChange={(value) => this.updateSetting('outgoing', 'pool_maxsize', value)}
                                    tooltip="Maximum number of connections per pool. Limits resource usage per search engine."
                                />
                            </div>

                            <TextInput
                                id="useragent-suffix"
                                label="User Agent Suffix"
                                value={settings.outgoing?.useragent_suffix || ''}
                                onChange={(value) => this.updateSetting('outgoing', 'useragent_suffix', value)}
                                placeholder="Optional suffix for user agent"
                                tooltip="Text appended to SearXNG's user agent string. Can include contact info in case search engines need to reach you."
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <CheckboxInput
                                    id="enable-http2"
                                    label="Enable HTTP/2"
                                    value={settings.outgoing?.enable_http2 ?? true}
                                    onChange={(value) => this.updateSetting('outgoing', 'enable_http2', value)}
                                    helpText="Use HTTP/2 for better performance"
                                    tooltip="Enable HTTP/2 protocol for outgoing requests. Provides better performance through multiplexing but may have compatibility issues with some engines."
                                />
                                <CheckboxInput
                                    id="using-tor"
                                    label="Use Tor Proxy"
                                    value={settings.outgoing?.using_tor_proxy || false}
                                    onChange={(value) => this.updateSetting('outgoing', 'using_tor_proxy', value)}
                                    helpText="Route requests through Tor"
                                    tooltip="Route all search engine requests through Tor for anonymity. Requires Tor to be installed and running. May significantly slow down searches."
                                />
                            </div>
                        </FormSection>

                        {/* Categories */}
                        <FormSection
                            title="Categories"
                            description="Categories displayed as tabs"
                            docLink="https://docs.searxng.org/admin/settings/settings.html#categories-as-tabs"
                        >
                            <ListInput
                                id="categories"
                                label="Active Categories"
                                items={settings.categories_as_tabs || []}
                                onChange={(value) => this.updateSetting('categories_as_tabs', null, value)}
                                placeholder="general, images, videos, news, etc."
                                helpText="Categories shown as tabs in the UI"
                                tooltip="Define which search categories appear as tabs in the interface. Common categories: general, images, videos, news, map, music, it, science, files, social media. Users can still search other categories using !bang commands."
                            />
                        </FormSection>

                        {/* Engines */}
                        <FormSection
                            title="Search Engines"
                            description="Configure search engines"
                            docLink="https://docs.searxng.org/admin/settings/settings_engines.html"
                        >
                            <EngineEditor
                                engines={settings.engines || []}
                                onChange={(value) => this.updateSetting('engines', null, value)}
                            />
                        </FormSection>

                        {/* Submit Button */}
                        <div className="flex justify-center gap-4 pt-6">
                            <button
                                type="button"
                                onClick={this.generateYAML}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <FileCode size={20} />
                                Generate settings.yml
                            </button>
                        </div>
                    </div>

                    {/* YAML Output */}
                    {showYaml && yamlOutput && (
                        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    Generated settings.yml
                                </h2>
                                <button
                                    type="button"
                                    onClick={this.downloadYAML}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download size={16} />
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
            </div>
        );
    }
}

export default SearXNGSettingsForm;