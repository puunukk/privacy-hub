/**
 * @fileoverview Docker API client with improved error handling and retry logic
 * @author Privacy Hub Dashboard
 */

import { configManager } from '@/config/appConfig';

/**
 * Docker API client with automatic retries and better error handling
 */
export class DockerApi {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor() {
    const config = configManager.getConfig();
    this.baseUrl = config.api.endpoints.docker;
    this.timeout = config.api.timeout;
    this.retries = config.api.retries;
  }

  /**
   * Make a request with retry logic
   */
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      console.warn(`Docker API request failed (attempt ${attempt}/${this.retries}):`, error);
      
      if (attempt < this.retries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, options, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Get Docker system information
   */
  async getSystemInfo(): Promise<any> {
    try {
      const response = await this.makeRequest('/info');
      return await response.json();
    } catch (error) {
      console.error('Failed to get Docker system info:', error);
      throw new Error('Docker service unavailable');
    }
  }

  /**
   * List all containers
   */
  async listContainers(all: boolean = true): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/containers/json?all=${all}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to list containers:', error);
      throw new Error('Unable to fetch container list');
    }
  }

  /**
   * Get container details
   */
  async getContainer(id: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/containers/${id}/json`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to get container ${id}:`, error);
      throw new Error(`Container ${id} not found`);
    }
  }

  /**
   * Start a container
   */
  async startContainer(id: string): Promise<void> {
    try {
      await this.makeRequest(`/containers/${id}/start`, { method: 'POST' });
    } catch (error) {
      console.error(`Failed to start container ${id}:`, error);
      throw new Error(`Unable to start container ${id}`);
    }
  }

  /**
   * Stop a container
   */
  async stopContainer(id: string, timeout: number = 10): Promise<void> {
    try {
      await this.makeRequest(`/containers/${id}/stop?t=${timeout}`, { method: 'POST' });
    } catch (error) {
      console.error(`Failed to stop container ${id}:`, error);
      throw new Error(`Unable to stop container ${id}`);
    }
  }

  /**
   * Restart a container
   */
  async restartContainer(id: string, timeout: number = 10): Promise<void> {
    try {
      await this.makeRequest(`/containers/${id}/restart?t=${timeout}`, { method: 'POST' });
    } catch (error) {
      console.error(`Failed to restart container ${id}:`, error);
      throw new Error(`Unable to restart container ${id}`);
    }
  }

  /**
   * Get container logs
   */
  async getContainerLogs(
    id: string, 
    options: {
      stdout?: boolean;
      stderr?: boolean;
      timestamps?: boolean;
      tail?: number;
    } = {}
  ): Promise<string> {
    try {
      const params = new URLSearchParams({
        stdout: String(options.stdout ?? true),
        stderr: String(options.stderr ?? true),
        timestamps: String(options.timestamps ?? false),
        ...(options.tail && { tail: String(options.tail) })
      });
      
      const response = await this.makeRequest(`/containers/${id}/logs?${params}`);
      return await response.text();
    } catch (error) {
      console.error(`Failed to get logs for container ${id}:`, error);
      throw new Error(`Unable to fetch logs for container ${id}`);
    }
  }

  /**
   * Get container stats (streaming disabled for single call)
   */
  async getContainerStats(id: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/containers/${id}/stats?stream=false`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to get stats for container ${id}:`, error);
      throw new Error(`Unable to fetch stats for container ${id}`);
    }
  }

  /**
   * List Docker networks
   */
  async listNetworks(): Promise<any[]> {
    try {
      const response = await this.makeRequest('/networks');
      return await response.json();
    } catch (error) {
      console.error('Failed to list Docker networks:', error);
      throw new Error('Unable to fetch Docker networks');
    }
  }

  /**
   * Test Docker API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/version');
      return true;
    } catch (error) {
      console.error('Docker API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get Docker version information
   */
  async getVersion(): Promise<any> {
    try {
      const response = await this.makeRequest('/version');
      return await response.json();
    } catch (error) {
      console.error('Failed to get Docker version:', error);
      throw new Error('Unable to get Docker version');
    }
  }
}

/**
 * Singleton Docker API instance
 */
export const dockerApi = new DockerApi();

/**
 * Helper function to check if Docker is available
 */
export const checkDockerAvailability = async (): Promise<{
  available: boolean;
  error?: string;
  version?: string;
}> => {
  try {
    const isConnected = await dockerApi.testConnection();
    
    if (!isConnected) {
      return {
        available: false,
        error: 'Docker API is not responding'
      };
    }

    const version = await dockerApi.getVersion();
    return {
      available: true,
      version: version.Version
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};