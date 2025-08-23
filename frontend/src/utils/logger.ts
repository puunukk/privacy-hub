// Debug logger utility
const isDebugMode = import.meta.env.NODE_ENV === 'development' || 
                   import.meta.env.VITE_DEBUG === 'true' ||
                   localStorage.getItem('debug') === 'true'

export const logger = {
  debug: (...args: any[]) => {
    if (isDebugMode) {
      console.debug('[DEBUG]', ...args)
    }
  },
  
  info: (...args: any[]) => {
    console.info('[INFO]', ...args)
  },
  
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args)
  },
  
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  },
  
  // Group related logs
  group: (label: string, collapsed = false) => {
    if (isDebugMode) {
      collapsed ? console.groupCollapsed(label) : console.group(label)
    }
  },
  
  groupEnd: () => {
    if (isDebugMode) {
      console.groupEnd()
    }
  },
  
  // Performance timing
  time: (label: string) => {
    if (isDebugMode) {
      console.time(label)
    }
  },
  
  timeEnd: (label: string) => {
    if (isDebugMode) {
      console.timeEnd(label)
    }
  }
}

// Enable debug mode globally
if (typeof window !== 'undefined') {
  (window as any).enableDebug = () => {
    localStorage.setItem('debug', 'true')
    console.info('Debug logging enabled. Reload to see debug logs.')
  }
  
  (window as any).disableDebug = () => {
    localStorage.removeItem('debug')
    console.info('Debug logging disabled. Reload to hide debug logs.')
  }
}