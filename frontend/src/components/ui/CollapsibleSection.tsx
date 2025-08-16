import { PureComponent, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CollapsibleSectionProps {
    title: string
    icon: ReactNode
    children: ReactNode
    isExpanded: boolean
    onToggle: () => void
    status?: 'success' | 'warning' | 'error' | 'info'
    count?: number
    className?: string
}

export class CollapsibleSection extends PureComponent<CollapsibleSectionProps> {
    getStatusIcon = () => {
        const { status } = this.props
        switch (status) {
            case 'success':
                return <div className="w-2 h-2 rounded-full bg-green-500" />
            case 'warning':
                return <div className="w-2 h-2 rounded-full bg-yellow-500" />
            case 'error':
                return <div className="w-2 h-2 rounded-full bg-red-500" />
            case 'info':
                return <div className="w-2 h-2 rounded-full bg-blue-500" />
            default:
                return null
        }
    }

    render() {
        const {
            title,
            icon,
            children,
            isExpanded,
            onToggle,
            status,
            count,
            className
        } = this.props

        return (
            <div className={cn("border-b border-gray-200 dark:border-gray-700 last:border-b-0", className)}>
                {/* Section Header */}
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={onToggle}
                >
                    <div className="flex items-center space-x-3">
                        {icon}
                        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
                        {this.getStatusIcon()}
                        {count !== undefined && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                {count}
                            </span>
                        )}
                    </div>
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                </div>

                {/* Section Content */}
                {isExpanded && (
                    <div className="px-4 pb-4">
                        {children}
                    </div>
                )}
            </div>
        )
    }
}
