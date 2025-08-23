import { } from 'react'
import { getCommonTypographyClasses, type BaseTypographyProps } from './Typography'
import { cn } from '@/utils/cn'

interface TextProps extends BaseTypographyProps {
    size?: 'xs' | 'sm' | 'base' | 'lg'
    as?: keyof JSX.IntrinsicElements
}

const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
}

export const Text = ({ size = 'sm', as = 'span', children, color, weight, align, className, ...props }: TextProps) => {
  const Component = as

  const classes = cn(
    textSizeClasses[size],
    'transition-colors duration-200',
    getCommonTypographyClasses(color, weight, align, className)
  )

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}

Text.displayName = 'Text'
