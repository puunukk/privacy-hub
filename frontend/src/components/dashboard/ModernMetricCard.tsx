import { Component, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Typography } from '@/components/ui/Typography'

interface ModernMetricCardProps {
  title: string
  value?: string
  unit?: string
  icon: ReactNode
  trend: 'good' | 'caution' | 'warning' | 'neutral'
  subtitle?: string
  progress?: number
  isLoading?: boolean
  valueClass?: string
  children?: ReactNode
}

export class ModernMetricCard extends Component<ModernMetricCardProps> {
  render() {
    const {
      title,
      value,
      unit,
      icon,
      trend,
      subtitle,
      progress,
      isLoading = false,
      children
    } = this.props

    const trendColorMap = {
      good: 'emerald' as const,
      caution: 'amber' as const,
      warning: 'danger' as const,
      neutral: 'slate' as const
    }

    const progressColors = {
      good: 'from-emerald-500 to-teal-500',
      caution: 'from-amber-500 to-orange-500',
      warning: 'from-red-500 to-rose-500',
      neutral: 'from-slate-500 to-slate-600'
    }

    const glowColors = {
      good: 'shadow-emerald-200/30 dark:shadow-emerald-500/20',
      caution: 'shadow-amber-200/30 dark:shadow-amber-500/20',
      warning: 'shadow-red-200/30 dark:shadow-red-500/20',
      neutral: 'shadow-slate-200/20 dark:shadow-slate-500/10'
    }

    if (isLoading) {
      return (
        <div className={cn(
          "relative overflow-hidden",
          "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700",
          "rounded-2xl p-4",
          "transition-colors duration-300"
        )}>
          <div className="animate-pulse">
            <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-20 mb-3"></div>
            <div className="h-8 bg-gray-300 dark:bg-slate-700 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-24"></div>
          </div>
        </div>
      )
    }

    return (
      <div className={cn(
        "relative overflow-hidden",
        "bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800",
        "rounded-2xl p-4",
        "border border-gray-200 dark:border-slate-700/50",
        "transition-shadow duration-300",
        "shadow-sm hover:shadow-lg",
        `hover:${glowColors[trend]}`
      )}>
        {/* Background gradient effect */}
        {progress !== undefined && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `linear-gradient(90deg, transparent ${100 - progress}%, currentColor 100%)`,
              color: trend === 'good' ? '#10b981' : trend === 'caution' ? '#f59e0b' : trend === 'warning' ? '#ef4444' : '#64748b'
            }}
          />
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <Typography.Text variant="caption">
              {title}
            </Typography.Text>
            <div className={cn(
              "text-gray-400 dark:text-slate-400",
              trend === 'good' && "text-emerald-600 dark:text-emerald-500",
              trend === 'caution' && "text-amber-600 dark:text-amber-500",
              trend === 'warning' && "text-red-600 dark:text-red-500",
              trend === 'neutral' && "text-slate-600 dark:text-slate-500"
            )}>
              {icon}
            </div>
          </div>

          {value ? (
            <>
              <div className="flex items-baseline space-x-1">
                <Typography.Title
                  level={2}
                  color="primary"
                  className={cn("!font-bold", this.props.valueClass)}
                >
                  {value}
                </Typography.Title>
                {unit && (
                  <Typography.Text variant="unit">
                    {unit}
                  </Typography.Text>
                )}
              </div>
              
              {subtitle && (
                <Typography.Text
                  variant="body2"
                  className="mt-1 block"
                >
                  {subtitle}
                </Typography.Text>
              )}
            </>
          ) : children ? (
            <div className="mt-1">
              {children}
            </div>
          ) : null}

          {progress !== undefined && (
            <div className="mt-3">
              <div className="relative h-1 bg-gray-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    "bg-gradient-to-r",
                    progressColors[trend],
                    "transition-all duration-500 ease-out"
                  )}
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