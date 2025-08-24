import { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from '@reduxjs/toolkit'
import { Thermometer, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

import { RootState } from '@/store'
import { showNotification } from '@/store/appConfig/appConfigSlice'

import { selectCpuTemperature } from '@/store/metrics/selectors/selectCpuTemperature'
import { selectMetricsStatus } from '@/store/metrics/selectors/selectMetricsStatus'
import { selectMetricsError } from '@/store/metrics/selectors/selectMetricsError'
import { fetchMetricsRequest } from '@/store/metrics/metricsActions'
import { Typography } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

interface CpuTemperatureProps {
    // Redux props
    dispatch: Dispatch
    temperature: number | null
    status: 'UNKNOWN' | 'LOADING' | 'READY' | 'ERROR'
    error: string | null
    // Optional props
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

interface CpuTemperatureState {
    hasShownHighTempWarning: boolean
    hasShownDangerTempWarning: boolean
}

// Temperature thresholds for Raspberry Pi
const TEMP_THRESHOLDS = {
    NORMAL: 65,     // Below 65°C - Normal (green)
    WARM: 70,       // 65-70°C - Warm (yellow)  
    HIGH: 75,       // 70-75°C - High (orange)
    DANGER: 80,     // 75-80°C - Hot (red)
    CRITICAL: 85    // 80°C+ - Critical (dark red)
} as const

class CpuTemperature extends PureComponent<CpuTemperatureProps, CpuTemperatureState> {
    private intervalId: NodeJS.Timeout | null = null
    private readonly UPDATE_INTERVAL = 60000 // 60 seconds - much more reasonable for temperature

    constructor(props: CpuTemperatureProps) {
        super(props)
        this.state = {
            hasShownHighTempWarning: false,
            hasShownDangerTempWarning: false
        }
    }

    componentDidMount() {
        this.fetchMetrics()
        this.startPolling()
    }

    componentWillUnmount() {
        this.stopPolling()
    }

    componentDidUpdate(prevProps: CpuTemperatureProps) {
        const { temperature } = this.props

        // Check for temperature warnings when temperature changes
        if (temperature !== null && temperature !== prevProps.temperature) {
            this.checkTemperatureWarnings(temperature)
        }
    }

    private startPolling = () => {
        this.intervalId = setInterval(this.fetchMetrics, this.UPDATE_INTERVAL)
    }

    private stopPolling = () => {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    private fetchMetrics = () => {
        this.props.dispatch(fetchMetricsRequest())
    }

    private checkTemperatureWarnings = (temperature: number) => {
        const { dispatch } = this.props
        const { hasShownHighTempWarning, hasShownDangerTempWarning } = this.state

        // High temperature warning (75°C+)
        if (temperature >= TEMP_THRESHOLDS.HIGH && !hasShownHighTempWarning) {
            dispatch(showNotification({
                id: `high-temp-${Date.now()}`,
                type: 'warning',
                title: 'High CPU Temperature',
                message: `CPU temperature is ${temperature}°C. Consider improving ventilation.`,
                duration: 8000,
                timestamp: Date.now()
            }))

            this.setState({ hasShownHighTempWarning: true })
        }

        // Danger temperature warning (80°C+)
        if (temperature >= TEMP_THRESHOLDS.DANGER && !hasShownDangerTempWarning) {
            dispatch(showNotification({
                id: `danger-temp-${Date.now()}`,
                type: 'error',
                title: 'Dangerous CPU Temperature!',
                message: `CPU temperature is ${temperature}°C! Risk of thermal throttling. Improve cooling immediately.`,
                duration: 15000,
                timestamp: Date.now()
            }))

            this.setState({ hasShownDangerTempWarning: true })
        }

        // Reset warning flags when temperature drops
        if (temperature < TEMP_THRESHOLDS.HIGH) {
            this.setState({
                hasShownHighTempWarning: false,
                hasShownDangerTempWarning: false
            })
        }
    }

    private getTemperatureStatus = (temp: number) => {
        if (temp >= TEMP_THRESHOLDS.CRITICAL) return 'critical'
        if (temp >= TEMP_THRESHOLDS.DANGER) return 'danger'
        if (temp >= TEMP_THRESHOLDS.HIGH) return 'high'
        if (temp >= TEMP_THRESHOLDS.WARM) return 'warm'
        return 'normal'
    }

    private getTemperatureColor = (temp: number) => {
        const status = this.getTemperatureStatus(temp)

        switch (status) {
            case 'critical':
                return 'text-red-900 dark:text-red-300'
            case 'danger':
                return 'text-red-600 dark:text-red-400'
            case 'high':
                return 'text-orange-600 dark:text-orange-400'
            case 'warm':
                return 'text-yellow-600 dark:text-yellow-400'
            case 'normal':
            default:
                return 'text-green-600 dark:text-green-400'
        }
    }

    private getTemperatureIcon = (temp: number) => {
        const status = this.getTemperatureStatus(temp)
        const iconProps = { className: "w-4 h-4" }

        switch (status) {
            case 'critical':
            case 'danger':
                return <AlertTriangle {...iconProps} className={cn(iconProps.className, "text-red-600 dark:text-red-400")} />
            case 'high':
                return <AlertCircle {...iconProps} className={cn(iconProps.className, "text-orange-600 dark:text-orange-400")} />
            case 'warm':
                return <Thermometer {...iconProps} className={cn(iconProps.className, "text-yellow-600 dark:text-yellow-400")} />
            case 'normal':
            default:
                return <CheckCircle {...iconProps} className={cn(iconProps.className, "text-green-600 dark:text-green-400")} />
        }
    }

    private getStatusText = (temp: number) => {
        const status = this.getTemperatureStatus(temp)

        switch (status) {
            case 'critical':
                return 'Critical'
            case 'danger':
                return 'Hot'
            case 'high':
                return 'High'
            case 'warm':
                return 'Warm'
            case 'normal':
            default:
                return 'Normal'
        }
    }

    render() {
        const { showLabel = true, size = 'md', className, temperature, status, error } = this.props

        const containerClasses = cn(
            'inline-flex items-center space-x-2',
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg',
            className
        )

        const tempClasses = cn(
            'font-mono font-medium',
            temperature !== null ? this.getTemperatureColor(temperature) : 'text-gray-500 dark:text-gray-400'
        )

        if (status === 'LOADING') {
            return (
                <div className={containerClasses}>
                    <Thermometer className="w-4 h-4 text-gray-400 animate-pulse" />
                    {showLabel && (
                        <Typography.Text size="sm" color="muted">
                            Loading...
                        </Typography.Text>
                    )}
                </div>
            )
        }

        if (status === 'ERROR' || error || temperature === null) {
            return (
                <div className={containerClasses}>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    {showLabel && (
                        <Typography.Text size="sm" color="danger">
                            Temp Error
                        </Typography.Text>
                    )}
                </div>
            )
        }

        return (
            <div className={containerClasses}>
                {this.getTemperatureIcon(temperature)}
                <span className={tempClasses}>
                    {temperature}°C
                </span>
                {showLabel && (
                    <Typography.Text size="xs" color="muted">
                        ({this.getStatusText(temperature)})
                    </Typography.Text>
                )}
            </div>
        )
    }
}

// Redux connection - map state and dispatch
const mapStateToProps = (state: RootState) => ({
    temperature: selectCpuTemperature(state),
    status: selectMetricsStatus(state),
    error: selectMetricsError(state)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
    dispatch
})

export default connect(mapStateToProps, mapDispatchToProps)(CpuTemperature)
