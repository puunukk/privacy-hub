// Type definitions for metrics API response
export interface MemoryInfo {
  total: number   // Total memory in KB
  free: number    // Available memory in KB  
  used: number    // Used memory in KB
}

export interface DiskInfo {
  total: number   // Total disk space in bytes
  free: number    // Free disk space in bytes
  used: number    // Used disk space in bytes
}

export interface StorageDevice {
  name: string       // Device name (e.g., sda, mmcblk0)
  size: number       // Total size in bytes
  type: string       // Device type (SSD, HDD, SD, etc.)
  mountpoint: string // Where it's mounted
}

export interface StorageInfo {
  root_partition: DiskInfo                  // Root filesystem (/)
  partitions: Record<string, DiskInfo>      // All mounted partitions
  total_disks: number                       // Number of physical disks
  storage_devices: StorageDevice[]          // Physical storage devices
}

export interface SystemMetrics {
  cpu_temp: number        // CPU temperature in Celsius
  memory: MemoryInfo      // Memory information
  load_avg: string        // Load averages (1m 5m 15m)
  storage: StorageInfo    // Comprehensive storage information
  timestamp: number       // Unix timestamp
}