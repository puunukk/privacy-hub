import { PureComponent, type ReactNode } from 'react'
import { cn } from '../../../utils/cn'

// Base Typography Props - shared across all subcomponents
export interface BaseTypographyProps {
    color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'danger' | 'info'
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
    align?: 'left' | 'center' | 'right'
    className?: string
    children: ReactNode
}

// Color classes - shared across all typography components
export const colorClasses = {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-orange-600 dark:text-orange-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400'
}

// Weight classes - shared across all typography components
export const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
}

// Alignment classes - shared across all typography components
export const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
}

// Base Typography Component - not exported, used internally
export abstract class BaseTypography<T extends BaseTypographyProps> extends PureComponent<T> {
    protected getCommonClasses() {
        const { color = 'primary', weight, align = 'left', className } = this.props

        return cn(
            colorClasses[color],
            weight && weightClasses[weight],
            alignClasses[align],
            className
        )
    }
}
