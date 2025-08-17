// Version utility for displaying build information in the footer

// These are injected at build time by Vite's define option
declare const __BUILD_TIME__: string
declare const __BUILD_ID__: string

export interface VersionInfo {
    version: string
    buildId: string
    buildTime: string
    environment: string
    displayVersion: string
}

export function getVersionInfo(): VersionInfo {
    // Get version from package.json or environment, with fallback
    const version = (import.meta as any).env?.VITE_APP_VERSION || '0.0.1'

    // Use build timestamp that only changes when build actually happens
    const buildTime = __BUILD_TIME__ || new Date().toISOString()
    const buildId = __BUILD_ID__ || Math.floor(Date.now() / 1000).toString(36)

    // Force development mode for build:watch (which is what we want for dev)
    const environment = 'development'

    // Create a user-friendly display version
    let displayVersion = version

    // In development, append build timestamp (only changes when build happens)
    if (environment === 'development') {
        displayVersion = `${version}-dev.${buildId}`
    }

    // Debug log to verify it's working
    console.log('🔍 Version Info:', { version, buildId, environment, displayVersion })

    return {
        version,
        buildId,
        buildTime,
        environment,
        displayVersion
    }
}

export function getDisplayVersion(): string {
    return getVersionInfo().displayVersion
}
