import { PureComponent, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const buttonVariants = {
  primary: 'bg-blue-600 text-whiteee hover:bg-blue-700 focus:ring-2 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400 dark:bg-red-600 dark:hover:bg-red-700',
  warning: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700'
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

export class Button extends PureComponent<ButtonProps> {
  render() {
    const {
      variant = 'primary',
      size = 'md',
      className,
      children,
      ...props
    } = this.props

    const classes = cn(
      '!inline-flex !items-center !justify-center !rounded-lg !font-medium !transition-colors !focus:outline-none !disabled:opacity-50 !disabled:pointer-events-none',
      buttonVariants[variant],
      buttonSizes[size],
      //className
    )

    return (
      <button
        type="button"
        className={cn(className, classes)}
        style={{
          // Force override any external styles
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 1,
          ...props.style
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
}