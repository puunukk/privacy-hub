import { Component } from 'react'
import { RefreshCw, Download, Trash2 } from 'lucide-react'
import { dockerApi } from '@/api/dockerApi'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'

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
            const response = await dockerApi.getContainerLogs(
                this.props.containerId, 
                {
                    timestamps: this.state.showTimestamps,
                    tail: this.state.maxLines
                }
            )
            
            // Split the logs by lines and filter out empty lines
            const logLines = response.split('\n').filter(line => line.trim().length > 0)
            
            this.setState({ 
                logs: logLines, 
                isLoading: false 
            })
        } catch (error) {
            this.setState({ 
                error: error instanceof Error ? error.message : 'Failed to fetch logs', 
                isLoading: false 
            })
        }
    }

    toggleAutoRefresh = () => {
        const newAutoRefresh = !this.state.autoRefresh
        this.setState({ autoRefresh: newAutoRefresh })
        
        if (newAutoRefresh) {
            this.autoRefreshTimer = setInterval(() => {
                this.fetchLogs()
            }, 5000)
        } else {
            if (this.autoRefreshTimer) {
                clearInterval(this.autoRefreshTimer)
                this.autoRefreshTimer = undefined
            }
        }
    }

    downloadLogs = () => {
        const { containerName } = this.props
        const { logs } = this.state
        
        const logContent = logs.join('\n')
        const blob = new Blob([logContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `${containerName}-logs-${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    clearLogs = () => {
        if (window.confirm('Clear all displayed logs? This will not affect the actual container logs.')) {
            this.setState({ logs: [] })
        }
    }

    render() {
        const { containerName, onClose } = this.props
        const { logs, isLoading, error, autoRefresh, showTimestamps } = this.state

        return (
            <Modal
                isOpen={true}
                onClose={onClose}
                title={`Container Logs: ${containerName}`}
                size="lg"
            >
                <div className="flex flex-col h-[calc(90vh-8rem)]">
                    {/* Action Header */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 -mx-4 -mt-4 mb-4">
                        <div className="flex items-center space-x-2 flex-wrap">
                            <Button
                                onClick={this.fetchLogs}
                                disabled={isLoading}
                                variant="ghost"
                                size="sm"
                                className="p-2"
                                aria-label="Refresh logs"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            
                            <Button
                                onClick={this.toggleAutoRefresh}
                                variant={autoRefresh ? 'primary' : 'secondary'}
                                size="sm"
                                className="px-2 py-1 text-xs"
                            >
                                Auto {autoRefresh ? 'ON' : 'OFF'}
                            </Button>

                            <Button
                                onClick={this.downloadLogs}
                                variant="ghost"
                                size="sm"
                                className="p-2 text-green-600"
                                aria-label="Download logs"
                            >
                                <Download className="h-4 w-4" />
                            </Button>

                            <Button
                                onClick={this.clearLogs}
                                variant="ghost"
                                size="sm"
                                className="p-2 text-red-600"
                                aria-label="Clear displayed logs"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={showTimestamps}
                                        onChange={(e) => this.setState({ showTimestamps: e.target.checked })}
                                        className="rounded"
                                    />
                                    <Typography.Text size="sm">Timestamps</Typography.Text>
                                </label>
                                
                                <select
                                    value={this.state.maxLines}
                                    onChange={(e) => this.setState({ maxLines: parseInt(e.target.value) })}
                                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value={100}>100 lines</option>
                                    <option value={500}>500 lines</option>
                                    <option value={1000}>1000 lines</option>
                                    <option value={5000}>5000 lines</option>
                                </select>
                            </div>
                            
                            <Typography.Text size="sm" color="muted">
                                {logs.length} lines • {isLoading ? 'Loading...' : 'Ready'}
                            </Typography.Text>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg mb-4">
                            <Typography.Text size="sm" color="warning">
                                {error}
                            </Typography.Text>
                        </div>
                    )}

                    {/* Logs content */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {isLoading && logs.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                                <Typography.Text color="muted" className="ml-2">Loading logs...</Typography.Text>
                            </div>
                        ) : (
                            <div className="flex-1 bg-gray-900 dark:bg-black text-green-400 overflow-auto font-mono text-sm rounded-lg">
                                {logs.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8 px-4">
                                        <div className="text-lg mb-2">📝</div>
                                        <Typography.Text>No logs available</Typography.Text>
                                        <Typography.Text size="xs" color="muted" className="mt-2 block">
                                            Try refreshing or check if the container is running
                                        </Typography.Text>
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-0.5">
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
                </div>
            </Modal>
        )
    }
}