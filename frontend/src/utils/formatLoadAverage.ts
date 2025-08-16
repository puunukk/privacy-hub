/**
 * Formats load average values into user-friendly descriptions
 * 
 * @param loadAvg - Load average string like "0.51 1.28 2.11"
 * @returns Formatted string with interpretation
 */
export const formatLoadAverage = (loadAvg: string): string => {
    if (!loadAvg) return 'N/A'

    const values = loadAvg.split(' ').map(v => parseFloat(v)).filter(v => !isNaN(v))
    if (values.length === 0) return 'N/A'

    // Get the 1-minute average (most recent)
    const currentLoad = values[0]

    // Determine load status based on typical thresholds
    let status: string
    let color: string

    if (currentLoad < 0.5) {
        status = 'Idle'
        color = 'text-green-600'
    } else if (currentLoad < 1.0) {
        status = 'Low'
        color = 'text-blue-600'
    } else if (currentLoad < 2.0) {
        status = 'Normal'
        color = 'text-yellow-600'
    } else if (currentLoad < 4.0) {
        status = 'High'
        color = 'text-orange-600'
    } else {
        status = 'Very High'
        color = 'text-red-600'
    }

    return `${currentLoad.toFixed(2)} (${status})`
}

/**
 * Gets the color class for load average status
 */
export const getLoadAverageColor = (loadAvg: string): string => {
    if (!loadAvg) return 'text-gray-600'

    const values = loadAvg.split(' ').map(v => parseFloat(v)).filter(v => !isNaN(v))
    if (values.length === 0) return 'text-gray-600'

    const currentLoad = values[0]

    if (currentLoad < 0.5) return 'text-green-600'
    if (currentLoad < 1.0) return 'text-blue-600'
    if (currentLoad < 2.0) return 'text-yellow-600'
    if (currentLoad < 4.0) return 'text-orange-600'
    return 'text-red-600'
}

/**
 * Safely formats load average data regardless of input format
 * Handles string, array, number, or undefined/null values
 */
export const safeFormatLoadAverage = (loadAvg: any): string => {
    if (!loadAvg) return 'N/A'

    if (typeof loadAvg === 'string') {
        return formatLoadAverage(loadAvg)
    }

    if (Array.isArray(loadAvg)) {
        return loadAvg.join(', ')
    }

    if (typeof loadAvg === 'number') {
        return loadAvg.toFixed(2)
    }

    return String(loadAvg)
}

/**
 * Safely gets color for load average data regardless of input format
 */
export const safeGetLoadAverageColor = (loadAvg: any): string => {
    if (!loadAvg) return 'text-gray-600'

    if (typeof loadAvg === 'string') {
        return getLoadAverageColor(loadAvg)
    }

    if (Array.isArray(loadAvg) && loadAvg.length > 0) {
        const firstValue = parseFloat(loadAvg[0])
        if (!isNaN(firstValue)) {
            if (firstValue < 0.5) return 'text-green-600'
            if (firstValue < 1.0) return 'text-blue-600'
            if (firstValue < 2.0) return 'text-yellow-600'
            if (firstValue < 4.0) return 'text-orange-600'
            return 'text-red-600'
        }
    }

    if (typeof loadAvg === 'number') {
        if (loadAvg < 0.5) return 'text-green-600'
        if (loadAvg < 1.0) return 'text-blue-600'
        if (loadAvg < 2.0) return 'text-yellow-600'
        if (loadAvg < 4.0) return 'text-orange-600'
        return 'text-red-600'
    }

    return 'text-gray-600'
}
