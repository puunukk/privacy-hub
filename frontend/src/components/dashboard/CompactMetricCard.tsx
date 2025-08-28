import { Component, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CompactMetricCardProps {
  title: string
  value: string
  icon: ReactNode
  trend: 'good' | 'caution' | 'warning' | 'neutral'
  subtitle?: string
  progress?: number
  isLoading?: boolean
  compact?: boolean
}

export class CompactMetricCard extends Component<CompactMetricCardProps> {
  render() {
    const { title, value, icon, trend, subtitle, progress, isLoading = false, compact = false } = this.props

    const trendColors = {
      good: 'text-emerald-600 dark:text-emerald-400',
      caution: 'text-amber-600 dark:text-amber-400', 
      warning: 'text-rose-600 dark:text-rose-400',
      neutral: 'text-slate-600 dark:text-slate-400'
    }

    const progressColors = {
      good: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
      caution: 'bg-gradient-to-r from-amber-400 to-amber-500',
      warning: 'bg-gradient-to-r from-rose-400 to-rose-500', 
      neutral: 'bg-gradient-to-r from-slate-400 to-slate-500'
    }

    const iconBgColors = {
      good: 'bg-emerald-50 dark:bg-emerald-900/10 ring-1 ring-emerald-200 dark:ring-emerald-800',
      caution: 'bg-amber-50 dark:bg-amber-900/10 ring-1 ring-amber-200 dark:ring-amber-800',
      warning: 'bg-rose-50 dark:bg-rose-900/10 ring-1 ring-rose-200 dark:ring-rose-800',
      neutral: 'bg-slate-50 dark:bg-slate-900/10 ring-1 ring-slate-200 dark:ring-slate-800'
    }

    const cardClasses = cn(
      "group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm",
      "rounded-xl border border-gray-200/50 dark:border-gray-700/50",
      compact ? "p-3 sm:p-4" : "p-4 sm:p-5",
      "transition-all duration-200",
      "hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20",
      "hover:border-gray-300/50 dark:hover:border-gray-600/50",
      "hover:scale-[1.02]"
    )

    if (isLoading) {
      return (
        <div className={cardClasses}>
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-14 mb-1.5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      )
    }

    return (
      <div className={cardClasses}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {title}
            </h3>
            <div className={cn(
              compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
              "font-bold mt-1",
              trendColors[trend]
            )}>
              {value}
            </div>
          </div>
          
          <div className={cn(
            "flex items-center justify-center",
            compact ? "w-9 h-9" : "w-10 h-10 sm:w-12 sm:h-12",
            "rounded-lg transition-all duration-200",
            iconBgColors[trend],
            "group-hover:scale-110"
          )}>
            <div className={cn(trendColors[trend], compact ? "scale-90" : "")}>
              {icon}
            </div>
          </div>
        </div>

        {subtitle && (
          <p className={cn(
            "text-xs text-gray-500 dark:text-gray-400",
            "truncate"
          )}>
            {subtitle}
          </p>
        )}

        {typeof progress === 'number' && (
          <div className="mt-3">
            <div className="relative w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
              <div 
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
                  progressColors[trend]
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
              <div 
                className={cn(
                  "absolute inset-y-0 rounded-full opacity-30",
                  progressColors[trend],
                  "animate-pulse"
                )}
                style={{ 
                  width: `${Math.min(progress, 100)}%`,
                  filter: 'blur(4px)'
                }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }
}