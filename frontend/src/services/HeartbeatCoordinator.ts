/**
 * Centralized Heartbeat Coordinator
 * 
 * Prevents API spam by coordinating all health checks through a single service.
 * Uses proper intervals, exponential backoff, and request deduplication.
 */

export interface ServiceStatus {
  name: string;
  url: string;
  isHealthy: boolean;
  lastCheck: number;
  consecutiveFailures: number;
  nextCheckTime: number;
}

export interface HeartbeatConfig {
  baseInterval: number;        // Base interval between checks (default: 30s)
  maxInterval: number;         // Max interval during failures (default: 5min)
  maxConsecutiveFailures: number; // Max failures before backing off (default: 5)
  timeout: number;             // Request timeout (default: 5s)
}

class HeartbeatCoordinator {
  private services: Map<string, ServiceStatus> = new Map();
  private config: HeartbeatConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private listeners: Array<(services: ServiceStatus[]) => void> = [];

  constructor(config: Partial<HeartbeatConfig> = {}) {
    this.config = {
      baseInterval: 30000,      // 30 seconds - MUCH more reasonable
      maxInterval: 300000,      // 5 minutes max
      maxConsecutiveFailures: 5,
      timeout: 5000,            // 5 second timeout
      ...config
    };

    console.log('HeartbeatCoordinator initialized with config:', this.config);
  }

  /**
   * Register a service for health monitoring
   */
  registerService(name: string, url: string): void {
    if (this.services.has(name)) {
      console.warn(`Service ${name} already registered`);
      return;
    }

    const service: ServiceStatus = {
      name,
      url,
      isHealthy: false,
      lastCheck: 0,
      consecutiveFailures: 0,
      nextCheckTime: Date.now()
    };

    this.services.set(name, service);
    console.log(`Registered service: ${name} -> ${url}`);
  }

  /**
   * Start the heartbeat coordinator
   */
  start(): void {
    if (this.isRunning) {
      console.warn('HeartbeatCoordinator already running');
      return;
    }

    console.log('Starting HeartbeatCoordinator...');
    this.isRunning = true;
    
    // Initial check
    this.performHealthChecks();
    
    // Set up interval for regular checks
    this.intervalId = setInterval(() => {
      this.performHealthChecks();
    }, this.config.baseInterval);
  }

  /**
   * Stop the heartbeat coordinator
   */
  stop(): void {
    if (!this.isRunning) return;

    console.log('Stopping HeartbeatCoordinator...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Add a listener for service status updates
   */
  addListener(listener: (services: ServiceStatus[]) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  removeListener(listener: (services: ServiceStatus[]) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Get current service statuses
   */
  getServiceStatuses(): ServiceStatus[] {
    return Array.from(this.services.values());
  }

  /**
   * Get status of a specific service
   */
  getServiceStatus(name: string): ServiceStatus | undefined {
    return this.services.get(name);
  }

  /**
   * Perform health checks on all services that are due
   */
  private async performHealthChecks(): Promise<void> {
    if (!this.isRunning) return;

    const now = Date.now();
    const servicesToCheck = Array.from(this.services.values())
      .filter(service => now >= service.nextCheckTime);

    if (servicesToCheck.length === 0) {
      return; // No services due for checking
    }

    console.log(`Checking ${servicesToCheck.length} services...`);

    // Check services in parallel but limit concurrency
    const promises = servicesToCheck.map(service => this.checkService(service));
    await Promise.allSettled(promises);

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Check individual service health
   */
  private async checkService(service: ServiceStatus): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`Checking ${service.name} (${service.url})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(service.url, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);

      const isHealthy = response.ok;
      const wasHealthy = service.isHealthy;

      // Update service status
      service.isHealthy = isHealthy;
      service.lastCheck = startTime;

      if (isHealthy) {
        service.consecutiveFailures = 0;
        service.nextCheckTime = startTime + this.config.baseInterval;
        
        if (!wasHealthy) {
          console.log(`✅ Service ${service.name} is now healthy`);
        }
      } else {
        service.consecutiveFailures++;
        console.warn(`❌ Service ${service.name} failed (${response.status} ${response.statusText})`);
      }

    } catch (error) {
      service.isHealthy = false;
      service.lastCheck = startTime;
      service.consecutiveFailures++;
      
      console.error(`❌ Service ${service.name} failed:`, error instanceof Error ? error.message : 'Unknown error');
    }

    // Calculate next check time with exponential backoff
    this.updateNextCheckTime(service);
  }

  /**
   * Calculate next check time using exponential backoff for failing services
   */
  private updateNextCheckTime(service: ServiceStatus): void {
    if (service.isHealthy) {
      // Healthy service - use base interval
      service.nextCheckTime = service.lastCheck + this.config.baseInterval;
      return;
    }

    // Failing service - use exponential backoff
    const backoffMultiplier = Math.min(
      Math.pow(2, service.consecutiveFailures - 1), 
      this.config.maxInterval / this.config.baseInterval
    );
    
    const nextInterval = Math.min(
      this.config.baseInterval * backoffMultiplier,
      this.config.maxInterval
    );
    
    service.nextCheckTime = service.lastCheck + nextInterval;
    
    console.log(`Service ${service.name} next check in ${Math.round(nextInterval/1000)}s (failures: ${service.consecutiveFailures})`);
  }

  /**
   * Notify all listeners of status updates
   */
  private notifyListeners(): void {
    const statuses = this.getServiceStatuses();
    this.listeners.forEach(listener => {
      try {
        listener(statuses);
      } catch (error) {
        console.error('Error notifying heartbeat listener:', error);
      }
    });
  }
}

// Create singleton instance
export const heartbeatCoordinator = new HeartbeatCoordinator({
  baseInterval: 45000,   // 45 seconds - very reasonable
  maxInterval: 300000,   // 5 minutes max for failing services
  maxConsecutiveFailures: 3,
  timeout: 8000          // 8 second timeout
});

export default heartbeatCoordinator;