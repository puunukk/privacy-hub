export interface DockerContainer {
  Id: string
  Names: string[]
  Image: string
  ImageID: string
  Command: string
  Created: number
  Ports: Array<{
    IP?: string
    PrivatePort: number
    PublicPort?: number
    Type: string
  }>
  Labels: Record<string, string>
  State: string
  Status: string
  HostConfig: {
    NetworkMode: string
  }
  NetworkSettings: {
    Networks: Record<string, {
      IPAddress: string
      Gateway: string
      NetworkID: string
    }>
  }
  Mounts: Array<{
    Type: string
    Source: string
    Destination: string
    Mode: string
    RW: boolean
    Propagation: string
  }>
  // Runtime stats (populated when container is running)
  cpuUsage?: string
  memUsage?: string
}

export interface DockerInfo {
  ID: string
  Containers: number
  ContainersRunning: number
  ContainersPaused: number
  ContainersStopped: number
  Images: number
  Driver: string
  DriverStatus: Array<[string, string]>
  SystemStatus: Array<[string, string]> | null
  Plugins: {
    Volume: string[]
    Network: string[]
    Authorization: string[] | null
    Log: string[]
  }
  MemoryLimit: boolean
  SwapLimit: boolean
  KernelMemory: boolean
  CpuCfsPeriod: boolean
  CpuCfsQuota: boolean
  CPUShares: boolean
  CPUSet: boolean
  PidsLimit: boolean
  IPv4Forwarding: boolean
  BridgeNfIptables: boolean
  BridgeNfIp6tables: boolean
  Debug: boolean
  NFd: number
  OomKillDisable: boolean
  NGoroutines: number
  SystemTime: string
  LoggingDriver: string
  CgroupDriver: string
  NEventsListener: number
  KernelVersion: string
  OperatingSystem: string
  OSType: string
  Architecture: string
  IndexServerAddress: string
  NCPU: number
  MemTotal: number
  DockerRootDir: string
  HttpProxy: string
  HttpsProxy: string
  NoProxy: string
  Name: string
  Labels: string[]
  ExperimentalBuild: boolean
  ServerVersion: string
  ClusterStore: string
  ClusterAdvertise: string
  Runtimes: Record<string, { path: string }>
  DefaultRuntime: string
  Swarm: {
    NodeID: string
    NodeAddr: string
    LocalNodeState: string
    ControlAvailable: boolean
    Error: string
    RemoteManagers: Array<{
      NodeID: string
      Addr: string
    }> | null
  }
  LiveRestoreEnabled: boolean
  Isolation: string
  InitBinary: string
  ContainerdCommit: {
    ID: string
    Expected: string
  }
  RuncCommit: {
    ID: string
    Expected: string
  }
  InitCommit: {
    ID: string
    Expected: string
  }
  SecurityOptions: string[]
}

export interface ContainerStats {
  read: string
  memory_stats: {
    usage?: number
    max_usage?: number
    limit?: number
    cache?: number
    stats?: {
      active_anon?: number
      active_file?: number
      anon?: number
      file?: number
      cache?: number
      rss?: number
      rss_huge?: number
      total_rss?: number
      mapped_file?: number
      pgpgin?: number
      pgpgout?: number
      pgfault?: number
      pgmajfault?: number
      inactive_anon?: number
      inactive_file?: number
      unevictable?: number
      [key: string]: number | undefined
    }
  }
  cpu_stats: {
    cpu_usage: {
      total_usage: number
    }
    system_cpu_usage: number
  }
  precpu_stats: {
    cpu_usage: {
      total_usage: number
    }
    system_cpu_usage: number
  }
  blkio_stats: {
    io_service_bytes_recursive: Array<{
      op: string
      value: number
    }>
  }
}

export type ContainerAction = 'start' | 'stop' | 'restart' | 'remove' | 'privacy_reset'