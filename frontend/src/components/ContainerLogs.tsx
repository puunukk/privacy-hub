import { Component } from 'react'
import { X, RefreshCw } from 'lucide-react'

interface ContainerLogsProps {
    containerId: string
    containerName: string
    onClose: () => void
}

interface ContainerLogsState {
    logs: string[]
    isLoading: boolean
    error: string | null
}

export class ContainerLogs extends Component<ContainerLogsProps, ContainerLogsState> {
    constructor(props: ContainerLogsProps) {
        super(props)
        this.state = {
            logs: [],
            isLoading: false,
            error: null
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

    fetchLogs = async () => {
        this.setState({ isLoading: true, error: null })

        try {
            // For now, we'll simulate fetching logs
            // In a real implementation, this would call your backend API
            const response = await fetch(`/api/containers/${this.props.containerId}/logs`)

            if (!response.ok) {
                throw new Error(`Failed to fetch logs: ${response.statusText}`)
            }

            const logsText = await response.text()
            const logs = logsText.split('\n').filter(line => line.trim() !== '')

            this.setState({ logs, isLoading: false })
        } catch (error) {
            // For demo purposes, show some mock logs if the API isn't available
            const mockLogs = [
                `[${new Date().toISOString()}] Container ${this.props.containerName} started`,
                `[${new Date().toISOString()}] Initializing services...`,
                `[${new Date().toISOString()}] Service ready and listening`,
                `[${new Date().toISOString()}] Processing requests...`,
                `[${new Date().toISOString()}] Log fetching API not yet implemented`,
                `[${new Date().toISOString()}] Showing mock logs for demonstration`
            ]

            this.setState({
                logs: mockLogs,
                isLoading: false,
                error: 'API not implemented - showing mock logs'
            })
        }
    }

    render() {
        const { containerName, onClose } = this.props
        const { logs, isLoading, error } = this.state

        return (
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Container Logs: {containerName}
                            </h3>
                            <button
                                onClick={this.fetchLogs}
                                disabled={isLoading}
                                className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                title="Refresh logs"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
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
                    <div className="flex-1 overflow-auto p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading logs...</span>
                            </div>
                        ) : (
                            <div className="bg-black-10 backdrop-blur-sm text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-96">
                                {logs.length === 0 ? (
                                    <div className="text-gray-500">No logs available</div>
                                ) : (
                                    logs.map((log, index) => (
                                        <div key={index} className="mb-1 whitespace-pre-wrap break-all">
                                            {log}
                                        </div>
                                    ))
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
