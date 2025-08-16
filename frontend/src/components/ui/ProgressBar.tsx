import { PureComponent } from 'react'

interface ProgressBarProps {
    label: string
    used: number
    total: number
    unit: 'MB' | 'GB' | 'TB'
    color?: 'blue' | 'green' | 'yellow' | 'red'
    showPercentage?: boolean
    showValues?: boolean
}

export class ProgressBar extends PureComponent<ProgressBarProps> {
    private getColorClass(percentage: number, color?: string) {
        if (color) {
            switch (color) {
                case 'blue': return 'bg-blue-500'
                case 'green': return 'bg-green-500'
                case 'yellow': return 'bg-yellow-500'
                case 'red': return 'bg-red-500'
                default: return 'bg-blue-500'
            }
        }

        // Auto-color based on usage percentage
        if (percentage >= 90) return 'bg-red-500'
        if (percentage >= 75) return 'bg-yellow-500'
        if (percentage >= 50) return 'bg-blue-500'
        return 'bg-green-500'
    }

    private formatValue(value: number, unit: string) {
        if (unit === 'MB') {
            return `${value.toFixed(1)} MB`
        } else if (unit === 'GB') {
            return `${value.toFixed(1)} GB`
        } else if (unit === 'TB') {
            return `${value.toFixed(2)} TB`
        }
        return `${value.toFixed(1)} ${unit}`
    }

    render() {
        const { label, used, total, unit, color, showPercentage = true, showValues = true } = this.props

        const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0
        const colorClass = this.getColorClass(percentage, color)

        return (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    {showValues && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {this.formatValue(used, unit)} / {this.formatValue(total, unit)}
                            {showPercentage && (
                                <span className="ml-2 font-medium">
                                    ({percentage.toFixed(1)}%)
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                        className={`${colorClass} h-2.5 rounded-full transition-all duration-300 ease-out`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {!showValues && showPercentage && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                        {percentage.toFixed(1)}%
                    </div>
                )}
            </div>
        )
    }
}
