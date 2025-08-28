/**
 * @fileoverview Unified Data Manager - Single source of truth for all API calls
 * @author Privacy Hub Dashboard
 * 
 * This replaces the complex saga patterns with a simple, efficient approach:
 * - Single manager handles all data fetching
 * - Intelligent caching and scheduling 
 * - Clear separation of initial load vs polling
 * - Simple state updates without complex dispatches
 */

import { dockerApi } from './dockerApi';
import { checkPiholeHealth } from '@/api/piholeApi';
import { formatBytes } from '@/utils/systemUtils';

export interface DataState {
  containers: any[];
  dockerInfo: any;
  dockerNetworks: any[];
  systemMetrics: any;
  systemInfo: any;
  services: {
    docker: boolean;
    backend: boolean;
    pihole: boolean;
  };
  lastUpdated: {
    containers: number;
    dockerInfo: number;
    dockerNetworks: number;
    systemMetrics: number;
    systemInfo: number;
  };
  errors: {
    containers?: string;
    dockerInfo?: string;
    dockerNetworks?: string;
    systemMetrics?: string;
    systemInfo?: string;
  };
}

export type DataUpdateCallback = (data: Partial<DataState>) => void;

/**
 * Configuration for data fetching intervals and behavior
 */
interface DataManagerConfig {
  intervals: {
    containers: number;      // Container list refresh
    dockerInfo: number;      // Docker system info  
    dockerNetworks: number;  // Docker networks info
    systemMetrics: number;   // Pi metrics (CPU, memory, etc)
    systemInfo: number;      // Pi system info
    serviceCheck: number;    // Service availability check
  };
  retries: {
    max: number;
    backoffMs: number;
  };
  cache: {
    containers: number;      // Cache duration for containers
    dockerInfo: number;      // Cache duration for docker info
  };
}

const DEFAULT_CONFIG: DataManagerConfig = {
  intervals: {
    containers: 60000,       // Every 60 seconds - much more reasonable
    dockerInfo: 120000,      // Every 2 minutes
    dockerNetworks: 300000,  // Every 5 minutes (networks change rarely)
    systemMetrics: 45000,    // Every 45 seconds - much more reasonable
    systemInfo: 300000,      // Every 5 minutes
    serviceCheck: 60000,     // Every 60 seconds - much more reasonable
  },
  retries: {
    max: 2,                  // Reduced retries to avoid spam
    backoffMs: 1000,
  },
  cache: {
    containers: 15000,       // Cache for 15 seconds (increased)
    dockerInfo: 120000,      // Cache for 2 minutes (increased)
  }
};

/**
 * Unified Data Manager - handles all API calls efficiently
 */
export class DataManager {
  private config: DataManagerConfig;
  private data: DataState;
  private callbacks: Set<DataUpdateCallback> = new Set();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor(config: Partial<DataManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.data = this.getInitialState();
  }

  private getInitialState(): DataState {
    return {
      containers: [],
      dockerInfo: null,
      dockerNetworks: [],
      systemMetrics: null,
      systemInfo: null,
      services: {
        docker: false,
        backend: false,
        pihole: false,
      },
      lastUpdated: {
        containers: 0,
        dockerInfo: 0,
        dockerNetworks: 0,
        systemMetrics: 0,
        systemInfo: 0,
      },
      errors: {}
    };
  }

  /**
   * Subscribe to data updates
   */
  subscribe(callback: DataUpdateCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Get current data state
   */
  getData(): DataState {
    return { ...this.data };
  }

  /**
   * Emit data updates to all subscribers
   */
  private emit(updates: Partial<DataState>) {
    this.data = { ...this.data, ...updates };
    this.callbacks.forEach(callback => {
      try {
        callback(updates);
      } catch (error) {
        console.error('Data callback error:', error);
      }
    });
  }

  /**
   * Check if data is fresh enough (within cache duration)
   */
  private isCached(key: keyof DataState['lastUpdated'], cacheMs: number): boolean {
    const lastUpdate = this.data.lastUpdated[key];
    return lastUpdate > 0 && (Date.now() - lastUpdate) < cacheMs;
  }

  /**
   * Safe API call with error handling and retries
   */
  private async safeApiCall<T>(
    name: string, 
    apiCall: () => Promise<T>,
    retries = this.config.retries.max
  ): Promise<T | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await apiCall();
        
        // Clear any previous errors on success
        if (this.data.errors[name as keyof DataState['errors']]) {
          this.emit({
            errors: { ...this.data.errors, [name]: undefined }
          });
        }
        
        return result;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        
        if (attempt === retries) {
          // Final attempt failed - update error state
          this.emit({
            errors: { ...this.data.errors, [name]: errorMsg }
          });
          console.warn(`${name} failed after ${retries} attempts:`, errorMsg);
          return null;
        }
        
        // Wait before retry (exponential backoff)
        const delay = this.config.retries.backoffMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return null;
  }

  /**
   * Fetch containers with caching and stats
   */
  private async fetchContainers(): Promise<void> {
    // Check cache
    if (this.isCached('containers', this.config.cache.containers)) {
      return;
    }

    const containers = await this.safeApiCall('containers', () => 
      dockerApi.listContainers(true)
    );

    if (containers !== null) {
      // Fetch stats for running containers (limit to avoid spam)
      const containersWithStats = await Promise.all(
        containers.map(async (container: any) => {
          if (container.State === 'running') {
            try {
              // Add timeout and better error handling for stats
              const statsPromise = dockerApi.getContainerStats(container.Id);
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Stats timeout')), 2000)
              );
              
              const stats = await Promise.race([statsPromise, timeoutPromise]) as any;
              const cpuPercent = this.calculateCPUPercent(stats);
              const memoryUsage = this.calculateMemoryUsage(stats);
              const memoryLimit = stats.memory_stats?.limit || 0;
              
              return {
                ...container,
                // Formatted properties for UI components
                cpuUsage: `${cpuPercent.toFixed(1)}%`,
                memUsage: memoryLimit > 0 ? 
                  `${formatBytes(memoryUsage)} / ${formatBytes(memoryLimit)}` : 
                  formatBytes(memoryUsage),
                // Raw stats for other uses
                Stats: {
                  memory_usage: memoryUsage,
                  memory_limit: memoryLimit,
                  cpu_percent: cpuPercent,
                  network_rx: stats.networks?.eth0?.rx_bytes || 0,
                  network_tx: stats.networks?.eth0?.tx_bytes || 0
                }
              };
            } catch (error) {
              // If stats fail, return container without stats but don't spam console
              console.debug(`Stats failed for container ${container.Id.substring(0, 12)}: ${error instanceof Error ? error.message : 'Unknown error'}`);
              return container;
            }
          }
          return container;
        })
      );

      this.emit({
        containers: containersWithStats,
        lastUpdated: { ...this.data.lastUpdated, containers: Date.now() }
      });
    }
  }

  /**
   * Calculate CPU percentage from Docker stats
   */
  private calculateCPUPercent(stats: any): number {
    if (!stats.cpu_stats || !stats.precpu_stats) return 0;
    
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || 1;
    
    if (systemDelta > 0 && cpuDelta > 0) {
      return (cpuDelta / systemDelta) * cpuCount * 100;
    }
    
    return 0;
  }

  /**
   * Calculate actual memory usage from Docker stats
   * Handles both cgroup v1 and v2 formats
   */
  private calculateMemoryUsage(stats: any): number {
    const memory_stats = stats.memory_stats;
    
    if (!memory_stats) {
      return 0;
    }
    
    // Method 1: Direct usage field (cgroup v1)
    if (memory_stats.usage && memory_stats.usage > 0) {
      // In cgroup v1, we need to subtract cache to get actual memory usage
      const cache = memory_stats.stats?.cache || 0;
      return Math.max(0, memory_stats.usage - cache);
    }
    
    // Method 2: From detailed stats (cgroup v2 or when usage is not available)
    if (memory_stats.stats) {
      const memStats = memory_stats.stats;
      
      // Try different fields that represent memory usage
      // Priority order based on accuracy
      
      // RSS (Resident Set Size) - most accurate for actual memory usage
      if (memStats.rss && memStats.rss > 0) {
        return memStats.rss;
      }
      
      // Total RSS 
      if (memStats.total_rss && memStats.total_rss > 0) {
        return memStats.total_rss;
      }
      
      // Anonymous memory + file cache
      if ((memStats.anon || memStats.file)) {
        const anon = memStats.anon || 0;
        const file = memStats.file || 0;
        // For actual usage, we typically want anonymous memory
        // File cache can be reclaimed, so it's less critical
        return anon > 0 ? anon : (anon + file);
      }
      
      // Active + Inactive anonymous memory
      if (memStats.active_anon || memStats.inactive_anon) {
        const activeAnon = memStats.active_anon || 0;
        const inactiveAnon = memStats.inactive_anon || 0;
        return activeAnon + inactiveAnon;
      }
      
      // Fallback: Any value we can find
      const possibleFields = [
        'rss_huge',
        'mapped_file',
        'active_file',
        'inactive_file',
        'unevictable'
      ];
      
      for (const field of possibleFields) {
        const value = memStats[field];
        if (value && value > 0) {
          return value;
        }
      }
    }
    
    return 0;
  }


  /**
   * Fetch Docker info with caching
   */
  private async fetchDockerInfo(): Promise<void> {
    // Check cache
    if (this.isCached('dockerInfo', this.config.cache.dockerInfo)) {
      return;
    }

    const dockerInfo = await this.safeApiCall('dockerInfo', () => 
      dockerApi.getSystemInfo()
    );

    if (dockerInfo !== null) {
      this.emit({
        dockerInfo,
        lastUpdated: { ...this.data.lastUpdated, dockerInfo: Date.now() }
      });
    }
  }

  /**
   * Fetch Docker networks information
   */
  private async fetchDockerNetworks(): Promise<void> {
    const dockerNetworks = await this.safeApiCall('dockerNetworks', () => 
      dockerApi.listNetworks()
    );

    if (dockerNetworks !== null) {
      this.emit({
        dockerNetworks,
        lastUpdated: { ...this.data.lastUpdated, dockerNetworks: Date.now() }
      });
    }
  }

  /**
   * Fetch system metrics
   */
  private async fetchSystemMetrics(): Promise<void> {
    const systemMetrics = await this.safeApiCall('systemMetrics', async () => {
      const response = await fetch('/pi-system/metrics');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });

    if (systemMetrics !== null) {
      this.emit({
        systemMetrics,
        lastUpdated: { ...this.data.lastUpdated, systemMetrics: Date.now() }
      });
    }
  }

  /**
   * Fetch system info
   */
  private async fetchSystemInfo(): Promise<void> {
    const systemInfo = await this.safeApiCall('systemInfo', async () => {
      const response = await fetch('/pi-system/system');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });

    if (systemInfo !== null) {
      this.emit({
        systemInfo,
        lastUpdated: { ...this.data.lastUpdated, systemInfo: Date.now() }
      });
    }
  }

  /**
   * Check service availability
   */
  private async checkServices(): Promise<void> {
    const checkService = async (url: string): Promise<boolean> => {
      try {
        const response = await fetch(url, { 
          method: 'GET', 
          signal: AbortSignal.timeout(1000),
          cache: 'no-cache'
        });
        return response.ok;
      } catch {
        return false;
      }
    };

    const [docker, backend, pihole] = await Promise.all([
      checkService('/docker-api/version'),
      checkService('/pi-system/health'), 
      checkPiholeHealth()
    ]);

    const currentServices = this.data.services;
    const newServices = { docker, backend, pihole };

    // Only emit if services changed
    if (JSON.stringify(currentServices) !== JSON.stringify(newServices)) {
      this.emit({ services: newServices });
      
      // Log service changes
      Object.keys(newServices).forEach(service => {
        const wasUp = currentServices[service as keyof typeof currentServices];
        const isUp = newServices[service as keyof typeof newServices];
        if (wasUp !== isUp) {
          console.log(`🔄 Service ${service}: ${isUp ? 'restored' : 'lost'}`);
        }
      });
    }
  }

  /**
   * Schedule periodic data fetching
   */
  private scheduleDataFetch(
    name: string, 
    fetchFn: () => Promise<void>, 
    interval: number
  ): void {
    // Clear existing timer
    const existingTimer = this.timers.get(name);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    // Schedule new timer
    const timer = setInterval(async () => {
      if (this.isRunning) {
        await fetchFn();
      }
    }, interval);

    this.timers.set(name, timer);
  }

  /**
   * Start the data manager
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.debug('Data manager already running, skipping start');
      return;
    }

    console.log('🚀 Starting unified data manager...');
    this.isRunning = true;

    // Perform initial data load
    console.log('📡 Initial data load...');
    await Promise.allSettled([
      this.fetchContainers(),
      this.fetchDockerInfo(), 
      this.fetchDockerNetworks(),
      this.fetchSystemMetrics(),
      this.fetchSystemInfo(),
      this.checkServices()
    ]);

    // Schedule periodic updates
    this.scheduleDataFetch('containers', () => this.fetchContainers(), this.config.intervals.containers);
    this.scheduleDataFetch('dockerInfo', () => this.fetchDockerInfo(), this.config.intervals.dockerInfo);
    this.scheduleDataFetch('dockerNetworks', () => this.fetchDockerNetworks(), this.config.intervals.dockerNetworks);
    this.scheduleDataFetch('systemMetrics', () => this.fetchSystemMetrics(), this.config.intervals.systemMetrics);
    this.scheduleDataFetch('systemInfo', () => this.fetchSystemInfo(), this.config.intervals.systemInfo);
    this.scheduleDataFetch('serviceCheck', () => this.checkServices(), this.config.intervals.serviceCheck);

    console.log('✅ Data manager started with intervals:', this.config.intervals);
  }

  /**
   * Stop the data manager
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping data manager...');
    this.isRunning = false;

    // Clear all timers
    this.timers.forEach((timer, name) => {
      clearInterval(timer);
      console.log(`⏹️ Stopped ${name} polling`);
    });
    this.timers.clear();

    console.log('✅ Data manager stopped');
  }

  /**
   * Update configuration and restart with new settings
   */
  updateConfig(newConfig: Partial<DataManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isRunning) {
      console.log('🔄 Restarting data manager with new config...');
      this.stop();
      this.start();
    }
  }

  /**
   * Manually trigger a data refresh
   */
  async refresh(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('🔄 Manual data refresh...');
    await Promise.allSettled([
      this.fetchContainers(),
      this.fetchDockerInfo(),
      this.fetchDockerNetworks(),
      this.fetchSystemMetrics(), 
      this.fetchSystemInfo(),
      this.checkServices()
    ]);
  }

  /**
   * Get data manager statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      activeTimers: this.timers.size,
      config: this.config,
      lastUpdated: this.data.lastUpdated,
      errors: this.data.errors,
      subscribers: this.callbacks.size
    };
  }
}

/**
 * Singleton data manager instance
 * 
 * DISABLED: DataManager is replaced by UnifiedLoopManager saga
 * All polling logic is now centralized in /sagas/unifiedLoopManager.ts
 * This provides better control, UI management, and proper intervals.
 */
// export const dataManager = new DataManager();

// Temporary stub to prevent errors during migration
export const dataManager = {
  start: () => console.log('⚠️ DataManager.start() called - now handled by UnifiedLoopManager'),
  stop: () => console.log('⚠️ DataManager.stop() called - now handled by UnifiedLoopManager'),
  subscribe: (_callback: any) => () => {},
  getData: () => ({
    containers: [],
    dockerInfo: null,
    dockerNetworks: [],
    systemMetrics: null,
    systemInfo: null,
    services: { docker: false, backend: false, pihole: false },
    lastUpdated: {
      containers: 0,
      dockerInfo: 0,
      dockerNetworks: 0,
      systemMetrics: 0,
      systemInfo: 0
    },
    errors: {}
  }),
  refresh: () => Promise.resolve(),
  getStats: () => ({ 
    isRunning: false, 
    activeTimers: 0,
    config: { intervals: {} },
    lastUpdated: {},
    errors: {},
    subscribers: 0
  }),
  updateConfig: (_config: any) => {}
};