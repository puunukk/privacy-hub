// Consolidated System Utilities - Single source of truth for system calculations

// ===== BYTE FORMATTING =====
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export const formatBytesCompact = (bytes: number): string => {
  if (bytes === 0) return '0B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))}${sizes[i]}`
}

// ===== PERCENTAGE CALCULATIONS =====
export const calculatePercent = (used: number, total: number): number => {
  if (!total || total <= 0) return 0
  return (used / total) * 100
}

// ===== TREND DETERMINATION =====
export const getTrend = (percent: number, warningThreshold = 90, cautionThreshold = 75): 'good' | 'caution' | 'warning' | 'neutral' => {
  if (percent > warningThreshold) return 'warning'
  if (percent > cautionThreshold) return 'caution'
  return 'good'
}

// ===== MEMORY UTILITIES =====
export const detectMemoryUnit = (total: number): { isKilobytes: boolean; multiplier: number } => {
  // If total is between 1000-100000000, likely KB, otherwise bytes
  const isKilobytes = total > 1000 && total < 100000000
  return {
    isKilobytes,
    multiplier: isKilobytes ? 1024 : 1
  }
}

export const formatMemorySize = (bytes: number): string => {
  const gb = bytes / 1024 / 1024 / 1024
  if (gb >= 1) {
    return `${gb.toFixed(1)} GB`
  } else {
    const mb = bytes / 1024 / 1024
    return `${Math.round(mb)} MB`
  }
}

export const convertMemory = (used: number = 0, total: number = 0) => {
  if (!used || !total) return { usedFormatted: '0 MB', totalFormatted: '0 MB', percent: 0 }
  
  const { multiplier } = detectMemoryUnit(total)
  const usedBytes = used * multiplier
  const totalBytes = total * multiplier
  const percent = calculatePercent(usedBytes, totalBytes)
  
  return {
    usedFormatted: formatMemorySize(usedBytes),
    totalFormatted: formatMemorySize(totalBytes),
    percent
  }
}

// ===== STORAGE UTILITIES =====
export const convertStorage = (used: number = 0, total: number = 0, free: number = 0) => {
  if (!total) return { freeGB: '0.0', usedPercent: 0 }
  
  const freeGB = (free / 1024 / 1024 / 1024).toFixed(1)
  const usedPercent = calculatePercent(used, total)
  
  return { freeGB, usedPercent }
}

// ===== CPU LOAD UTILITIES =====
export const parseLoadAverage = (loadAvg: string): number[] => {
  if (!loadAvg) return [0, 0, 0]
  return loadAvg.split(' ').map(parseFloat).filter(v => !isNaN(v))
}

export const convertCpuLoad = (loadAvg: string = '', cores = 4) => {
  const loads = parseLoadAverage(loadAvg)
  const current = loads[0] || 0
  const load5m = loads[1] || 0
  const load15m = loads[2] || 0
  const percentUsed = Math.round((current / cores) * 100)
  
  return { current, load5m, load15m, percentUsed }
}

// ===== UPTIME UTILITIES =====
export const convertUptime = (uptime: string | number = 0) => {
  const seconds = typeof uptime === 'string' ? parseFloat(uptime) : uptime
  if (!seconds || isNaN(seconds)) return { value: '--', unit: '' }
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return { value: days.toString(), unit: `d ${hours}h` }
  } else if (hours > 0) {
    return { value: hours.toString(), unit: `h ${minutes}m` }
  } else {
    return { value: minutes.toString(), unit: 'm' }
  }
}

// ===== TEMPERATURE UTILITIES =====
export const convertTemperature = (temp: number = 0) => {
  if (!temp) return { value: '--', trend: 'neutral' as const, subtitle: 'No data' }
  
  const value = temp.toFixed(1)
  const trend = temp >= 80 ? 'warning' as const : temp >= 70 ? 'caution' as const : 'good' as const
  const subtitle = temp >= 80 ? 'Throttling!' : temp >= 70 ? 'Hot' : 'OK'
  
  return { value, trend, subtitle }
}

// ===== NETWORK UTILITIES =====
export const convertNetwork = (ip = '', gateway = '', dns = '') => {
  if (!ip) return { value: '--', trend: 'neutral' as const, subtitle: 'No network' }
  
  return {
    value: ip,
    trend: 'good' as const,
    subtitle: `GW: ${gateway || 'N/A'} • DNS: ${dns || 'N/A'}`
  }
}

// ===== CONTAINER UTILITIES (for Docker stats) =====
export const calculateContainerMemoryPercent = (usage: number, limit: number): number => {
  return calculatePercent(usage, limit)
}

export const calculateContainerCpuPercent = (cpuDelta: number, systemDelta: number): number => {
  if (systemDelta > 0 && cpuDelta > 0) {
    return (cpuDelta / systemDelta) * 100
  }
  return 0
}