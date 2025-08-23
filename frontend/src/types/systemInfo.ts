// Type definitions for system info API response
export interface SystemInfo {
  hostname: string      // System hostname
  ip: string           // Primary IP address
  gateway: string      // Default gateway
  dns: string          // Primary DNS server
  uptime: string       // System uptime
  isContainer?: boolean // Whether running in container
}