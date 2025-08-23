import { } from 'react'
import { getCommonTypographyClasses, BaseTypographyProps } from './Typography'
import { cn } from '@/utils/cn'

interface ParagraphProps extends BaseTypographyProps {
    size?: 'sm' | 'base' | 'lg'
    spacing?: 'tight' | 'normal' | 'relaxed'
}

const paragraphSizeClasses: Record<string, string> = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
}

const paragraphSpacingClasses: Record<string, string> = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed'
}

export const Paragraph = ({ size = 'base', spacing = 'normal', children, color, weight, align, className, ...props }: ParagraphProps) => {
  const classes = cn(
    paragraphSizeClasses[size],
    paragraphSpacingClasses[spacing],
    'transition-colors duration-200',
    getCommonTypographyClasses(color, weight, align, className)
  )

  return (
    <p className={classes} {...props}>
      {children}
    </p>
  )
}

Paragraph.displayName = 'Paragraph'
