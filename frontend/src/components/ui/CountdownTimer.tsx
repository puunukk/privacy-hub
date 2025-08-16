import { Component } from 'react'

interface CountdownTimerProps {
    lastUpdateTime: Date | null
    isPolling: boolean
    pollInterval: number
    className?: string
}

interface CountdownTimerState {
    countdown: number
}

export class CountdownTimer extends Component<CountdownTimerProps, CountdownTimerState> {
    private intervalId: NodeJS.Timeout | null = null

    constructor(props: CountdownTimerProps) {
        super(props)
        // Convert milliseconds to seconds
        const intervalInSeconds = Math.floor(props.pollInterval / 1000)
        this.state = {
            countdown: intervalInSeconds
        }
    }

    componentDidMount() {
        if (this.props.isPolling) {
            this.startTimer()
        }
    }

    componentDidUpdate(prevProps: CountdownTimerProps) {
        // Reset to poll interval when new data received
        if (prevProps.lastUpdateTime !== this.props.lastUpdateTime) {
            const intervalInSeconds = Math.floor(this.props.pollInterval / 1000)
            this.setState({ countdown: intervalInSeconds })
        }

        // Start/stop timer
        if (prevProps.isPolling !== this.props.isPolling) {
            if (this.props.isPolling) {
                this.startTimer()
            } else {
                this.stopTimer()
            }
        }
    }

    componentWillUnmount() {
        this.stopTimer()
    }

    private startTimer = () => {
        if (this.intervalId) return

        this.intervalId = setInterval(() => {
            this.setState(prevState => {
                const newCountdown = prevState.countdown - 1
                // Reset to poll interval when it hits 0
                const intervalInSeconds = Math.floor(this.props.pollInterval / 1000)
                return { countdown: newCountdown <= 0 ? intervalInSeconds : newCountdown }
            })
        }, 1000)
    }

    private stopTimer = () => {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    render() {
        const { lastUpdateTime, isPolling, className = '' } = this.props
        const { countdown } = this.state

        if (!isPolling) {
            return null
        }

        return (
            <span
                className={`text-blue-600 dark:text-blue-400 ${className}`}
                title={lastUpdateTime ?
                    `Last updated: ${lastUpdateTime.toLocaleString()}` :
                    'Auto-refresh enabled'
                }
            >
                Auto-refresh in {countdown}s
            </span>
        )
    }
}
