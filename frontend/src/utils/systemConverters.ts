// Simple converter utilities for system metrics
import { calculatePercent, formatMemorySize, detectMemoryUnit, convertUptime as convertUptimeBase, convertTemperature as convertTempBase, getTrend } from '@/utils/systemUtils'

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

export const convertStorage = (used: number = 0, total: number = 0, free: number = 0) => {
  if (!total) return { freeGB: '0.0', usedPercent: 0 }
  
  const freeGB = (free / 1024 / 1024 / 1024).toFixed(1)
  const usedPercent = calculatePercent(used, total)
  
  return {
    freeGB,
    usedPercent
  }
}

export const convertCpuLoad = (loadAvg: string = '', cores: number = 4) => {
  if (!loadAvg) return { current: 0, load5m: 0, load15m: 0, percentUsed: 0 }
  
  const loads = loadAvg.split(' ').map(parseFloat)
  const current = loads[0] || 0
  const load5m = loads[1] || 0
  const load15m = loads[2] || 0
  const percentUsed = Math.round((current / cores) * 100)
  
  return {
    current,
    load5m,
    load15m,
    percentUsed
  }
}

export const convertUptime = convertUptimeBase

export const convertTemperature = convertTempBase

export const convertNetwork = (ip: string = '', gateway: string = '', dns: string = '') => {
  if (!ip) return { value: '--', trend: 'neutral' as const, subtitle: 'No network' }
  
  return {
    value: ip,
    trend: 'good' as const,
    subtitle: `GW: ${gateway || 'N/A'} • DNS: ${dns || 'N/A'}`
  }
}

export const getTrendFromPercent = getTrend