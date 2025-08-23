import { Component } from 'react'
import { X, RefreshCw, Download, Trash2 } from 'lucide-react'
import { dockerApi } from '@/api/dockerApi'

interface ContainerLogsProps {
    containerId: string
    containerName: string
    onClose: () => void
}

interface ContainerLogsState {
    logs: string[]
    isLoading: boolean
    error: string | null
    autoRefresh: boolean
    maxLines: number
    showTimestamps: boolean
}

export class ContainerLogs extends Component<ContainerLogsProps, ContainerLogsState> {
    constructor(props: ContainerLogsProps) {
        super(props)
        this.state = {
            logs: [],
            isLoading: false,
            error: null,
            autoRefresh: false,
            maxLines: 1000,
            showTimestamps: true
        }
    }

    componentDidMount() {
        this.fetchLogs()
    }

    componentDidUpdate(prevProps: ContainerLogsProps) {
        if (prevProps.containerId !== this.props.containerId) {
            this.fetchLogs()
        }
    }

    private autoRefreshTimer?: NodeJS.Timeout

    componentWillUnmount() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer)
        }
    }

    fetchLogs = async () => {
        this.setState({ isLoading: true, error: null })

        try {
            // Use the Docker API to fetch real container logs
            const logsText = await dockerApi.getContainerLogs(this.props.containerId, {
                stdout: true,
                stderr: true,
                timestamps: this.state.showTimestamps,
                tail: this.state.maxLines
            })

            // Process Docker logs - they come with special formatting
            const logs = this.processDockerLogs(logsText)
            this.setState({ logs, isLoading: false })
        } catch (error) {
            console.error('Failed to fetch container logs:', error)
            
            // Show helpful error message with fallback mock logs
            const mockLogs = [
                `[${new Date().toISOString()}] ⚠️  Failed to fetch real container logs`,
                `[${new Date().toISOString()}] Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                `[${new Date().toISOString()}] This could be because:`,
                `[${new Date().toISOString()}] • Docker API is not accessible`,
                `[${new Date().toISOString()}] • Container logs are not available`,
                `[${new Date().toISOString()}] • Network connectivity issues`,
                `[${new Date().toISOString()}] `,
                `[${new Date().toISOString()}] 📝 Mock logs for ${this.props.containerName}:`,
                `[${new Date().toISOString()}] Container started successfully`,
                `[${new Date().toISOString()}] Service initialization complete`,
                `[${new Date().toISOString()}] Ready to accept connections`,
                `[${new Date().toISOString()}] Application running normally`
            ]

            this.setState({
                logs: mockLogs,
                isLoading: false,
                error: `Unable to fetch real logs: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
        }
    }

    private processDockerLogs = (rawLogs: string): string[] => {
        if (!rawLogs || rawLogs.trim() === '') {
            return ['[No logs available]']
        }

        // Docker logs can have binary headers, clean them up
        const lines = rawLogs.split('\n')
        return lines
            .map(line => {
                // Remove Docker log headers (8 bytes at start of each line)
                if (line.length > 8) {
                    const cleaned = line.substring(8)
                    return cleaned.trim()
                }
                return line.trim()
            })
            .filter(line => line.length > 0)
            .slice(-this.state.maxLines) // Keep only the last N lines
    }

    private toggleAutoRefresh = () => {
        const { autoRefresh } = this.state
        
        if (autoRefresh) {
            // Stop auto refresh
            if (this.autoRefreshTimer) {
                clearInterval(this.autoRefreshTimer)
                this.autoRefreshTimer = undefined
            }
        } else {
            // Start auto refresh every 5 seconds
            this.autoRefreshTimer = setInterval(() => {
                this.fetchLogs()
            }, 5000)
        }
        
        this.setState({ autoRefresh: !autoRefresh })
    }

    private downloadLogs = () => {
        const { logs } = this.state
        const { containerName } = this.props
        
        const logContent = logs.join('\n')
        const blob = new Blob([logContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `${containerName}-logs-${new Date().toISOString().slice(0, 19)}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    private clearLogs = () => {
        if (window.confirm('Clear all displayed logs? This will not affect the actual container logs.')) {
            this.setState({ logs: [] })
        }
    }

    render() {
        const { containerName, onClose } = this.props
        const { logs, isLoading, error, autoRefresh, showTimestamps } = this.state

        return (
            <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Container Logs: {containerName}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={this.fetchLogs}
                                    disabled={isLoading}
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded disabled:opacity-50 transition-colors"
                                    title="Refresh logs"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                                
                                <button
                                    onClick={this.toggleAutoRefresh}
                                    className={`px-3 py-1 text-xs rounded transition-colors ${
                                        autoRefresh 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}
                                    title={autoRefresh ? 'Stop auto-refresh' : 'Start auto-refresh (5s)'}
                                >
                                    {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                                </button>

                                <button
                                    onClick={this.downloadLogs}
                                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                    title="Download logs"
                                >
                                    <Download className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={this.clearLogs}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Clear displayed logs"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={showTimestamps}
                                        onChange={(e) => this.setState({ showTimestamps: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-gray-600 dark:text-gray-400">Show timestamps</span>
                                </label>
                                
                                <select
                                    value={this.state.maxLines}
                                    onChange={(e) => this.setState({ maxLines: parseInt(e.target.value) })}
                                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value={100}>Last 100 lines</option>
                                    <option value={500}>Last 500 lines</option>
                                    <option value={1000}>Last 1000 lines</option>
                                    <option value={5000}>Last 5000 lines</option>
                                </select>
                            </div>
                            
                            <div className="text-gray-500 dark:text-gray-400">
                                {logs.length} lines • {isLoading ? 'Loading...' : 'Ready'}
                            </div>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Logs content */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {isLoading && logs.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading logs...</span>
                            </div>
                        ) : (
                            <div className="flex-1 bg-gray-900 dark:bg-black text-green-400 p-4 overflow-auto font-mono text-sm">
                                {logs.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8">
                                        <div className="text-lg mb-2">📝</div>
                                        <div>No logs available</div>
                                        <div className="text-xs mt-2 text-gray-600">
                                            Try refreshing or check if the container is running
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-0.5">
                                        {logs.map((log, index) => {
                                            // Parse log line for better display
                                            const isError = log.toLowerCase().includes('error') || log.toLowerCase().includes('fail')
                                            const isWarning = log.toLowerCase().includes('warn') || log.toLowerCase().includes('warning')
                                            const isInfo = log.toLowerCase().includes('info') || log.toLowerCase().includes('start')
                                            
                                            let textColor = 'text-green-400'
                                            if (isError) textColor = 'text-red-400'
                                            else if (isWarning) textColor = 'text-yellow-400'
                                            else if (isInfo) textColor = 'text-blue-400'
                                            
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={`${textColor} whitespace-pre-wrap break-all leading-tight hover:bg-gray-800 dark:hover:bg-gray-900 px-2 py-0.5 rounded transition-colors`}
                                                >
                                                    <span className="text-gray-500 text-xs mr-2 select-none">
                                                        {(index + 1).toString().padStart(4, '0')}
                                                    </span>
                                                    {log}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
