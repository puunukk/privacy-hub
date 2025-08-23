import { } from 'react'
import { cn } from '@/utils/cn'
import { getCommonTypographyClasses } from './Typography'
import type { BaseTypographyProps } from './Typography'

interface TitleProps extends BaseTypographyProps {
    level?: 1 | 2 | 3 | 4 | 5 | 6
}

const titleSizeClasses: Record<string | number, string> = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-bold',
    3: 'text-xl font-semibold',
    4: 'text-lg font-medium',
    5: 'text-base font-medium',
    6: 'text-sm font-medium'
}

export const Title = ({ level = 2, children, color, weight, align, className, ...props }: TitleProps) => {
  const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  const classes = cn(
    titleSizeClasses[level],
    'transition-colors duration-200',
    getCommonTypographyClasses(color, weight, align, className)
  )

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}

Title.displayName = 'Title'
