import { } from 'react'
import { 
  getVariantClasses, 
  weightClasses,
  alignClasses,
  type BaseTypographyProps 
} from './Typography'
import { cn } from '@/utils/cn'

interface TextProps extends BaseTypographyProps {
  as?: keyof JSX.IntrinsicElements
  [key: string]: any // Allow other HTML attributes
}

export const Text = ({ 
  variant = 'body',
  as = 'span', 
  children, 
  color, 
  weight, 
  align, 
  className, 
  ...restProps 
}: TextProps) => {
  const Component = as

  // Remove all Typography-specific props that shouldn't be passed to DOM
  const { 
    variant: _variant, 
    color: _color, 
    weight: _weight, 
    align: _align,
    uppercase,
    tracking,
    lineHeight,
    ...domProps 
  } = restProps

  const classes = cn(
    getVariantClasses(variant, color),
    'transition-colors duration-200',
    // Only apply additional styles if variant doesn't cover everything
    weight && !variant && weightClasses[weight],
    align && alignClasses[align],
    className
  )

  return (
    <Component className={classes} {...domProps}>
      {children}
    </Component>
  )
}

Text.displayName = 'Text'
