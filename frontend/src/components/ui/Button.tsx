import React from 'react'
import { cn } from '../../utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        // Base styles with !important to override external CSS
        '!inline-flex !items-center !justify-center !rounded-lg !font-medium !transition-colors !focus:outline-none !disabled:opacity-50 !disabled:pointer-events-none',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
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