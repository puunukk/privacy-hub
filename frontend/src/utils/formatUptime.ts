export const formatUptime = (created: number): string => {
    const now = Date.now() / 1000
    const uptime = now - created

    if (uptime < 3600) {
        return `${Math.floor(uptime / 60)}m`
    } else if (uptime < 86400) {
        return `${Math.floor(uptime / 3600)}h`
    } else {
        return `${Math.floor(uptime / 86400)}d`
    }
}
