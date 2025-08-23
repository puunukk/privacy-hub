import { Component, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface MetricCardProps {
  title: string
  value: string
  icon: ReactNode
  trend: 'good' | 'caution' | 'warning' | 'neutral'
  subtitle?: string
  progress?: number
  isLoading?: boolean
}

export class MetricCard extends Component<MetricCardProps> {
  render() {
    const { title, value, icon, trend, subtitle, progress, isLoading = false } = this.props

    const trendColors = {
      good: 'text-green-600 dark:text-green-400',
      caution: 'text-yellow-600 dark:text-yellow-400', 
      warning: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400'
    }

    const progressColors = {
      good: 'bg-green-500',
      caution: 'bg-yellow-500',
      warning: 'bg-red-500', 
      neutral: 'bg-gray-500'
    }

    const cardClasses = cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
      "p-6 transition-all duration-200",
      "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
    )

    const iconClasses = cn(
      "p-2 rounded-lg",
      trend === 'good' && "bg-green-100 dark:bg-green-900/20",
      trend === 'caution' && "bg-yellow-100 dark:bg-yellow-900/20", 
      trend === 'warning' && "bg-red-100 dark:bg-red-900/20",
      trend === 'neutral' && "bg-gray-100 dark:bg-gray-700"
    )

    if (isLoading) {
      return (
        <div className={cardClasses}>
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      )
    }

    return (
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </h3>
          <div className={cn(iconClasses, trendColors[trend])}>
            {icon}
          </div>
        </div>

        <div className="space-y-2">
          <div className={cn("text-2xl font-bold", trendColors[trend])}>
            {value}
          </div>
          
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}

          {typeof progress === 'number' && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={cn("h-2 rounded-full transition-all duration-300", progressColors[trend])}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}