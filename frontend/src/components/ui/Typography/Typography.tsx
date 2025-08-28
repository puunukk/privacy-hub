import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

// Typography variants - comprehensive system for all text styles
export type TypographyVariant = 
  | 'base'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body' | 'body2' 
  | 'subtitle' | 'subtitle2'
  | 'caption' | 'overline'
  | 'button' | 'link'
  | 'mono' | 'mono-sm' | 'mono-xs'
  | 'mono-primary' | 'mono-success' | 'mono-warning' | 'mono-danger'
  | 'lead'
  | 'value' | 'value-sm' | 'value-lg'
  | 'unit' | 'unit-muted' | 'unit-accent'
  | 'status-good' | 'status-warning' | 'status-error' | 'status-neutral'

// Base Typography Props - shared across all subcomponents
export interface BaseTypographyProps {
    variant?: TypographyVariant
    color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'danger' | 'info' | 'emerald' | 'amber' | 'slate' | 'white'
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
    info: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-500',
    amber: 'text-amber-600 dark:text-amber-500',
    slate: 'text-slate-600 dark:text-slate-500',
    white: 'text-white'
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

// Type-safe variant configuration
type SizeKey = keyof typeof sizeClasses
type WeightKey = keyof typeof weightClasses  
type LineHeightKey = keyof typeof lineHeightClasses
type TrackingKey = keyof typeof trackingClasses
type FontFamilyKey = keyof typeof fontFamilyClasses
type ColorKey = keyof typeof colorClasses

interface VariantConfig {
  size?: SizeKey
  weight?: WeightKey
  lineHeight?: LineHeightKey
  tracking?: TrackingKey
  family?: FontFamilyKey
  color?: ColorKey
  uppercase?: boolean
}

type VariantStyles = Record<TypographyVariant, VariantConfig>

// Comprehensive variant definitions
export const variantStyles: VariantStyles = {
  base: {}, // No default styling - pure base
  
  // Headings
  h1: { size: '3xl', weight: 'bold', lineHeight: 'tight', color: 'primary' },
  h2: { size: '2xl', weight: 'bold', lineHeight: 'tight', color: 'primary' },
  h3: { size: 'xl', weight: 'bold', lineHeight: 'tight', color: 'primary' },
  h4: { size: 'lg', weight: 'semibold', lineHeight: 'tight', color: 'primary' },
  h5: { size: 'base', weight: 'semibold', lineHeight: 'tight', color: 'primary' },
  h6: { size: 'sm', weight: 'semibold', lineHeight: 'tight', color: 'primary' },
  
  // Body text
  body: { size: 'sm', weight: 'normal', lineHeight: 'normal', color: 'secondary' },
  body2: { size: 'xs', weight: 'normal', lineHeight: 'normal', color: 'secondary' },
  
  // Subtitles
  subtitle: { size: 'base', weight: 'medium', lineHeight: 'snug', color: 'primary' },
  subtitle2: { size: 'sm', weight: 'medium', lineHeight: 'snug', color: 'secondary' },
  
  // Small text
  caption: { size: '2xs', weight: 'medium', lineHeight: 'none', tracking: 'wider', uppercase: true, color: 'muted' },
  overline: { size: '2xs', weight: 'semibold', lineHeight: 'tight', tracking: 'widest', uppercase: true, color: 'muted' },
  
  // Interactive elements  
  button: { size: 'sm', weight: 'medium', lineHeight: 'none', color: 'primary' },
  link: { size: 'sm', weight: 'medium', lineHeight: 'normal', color: 'info' },
  
  // Monospace variants
  mono: { size: 'sm', weight: 'normal', lineHeight: 'normal', family: 'mono', color: 'secondary' },
  'mono-sm': { size: 'xs', weight: 'normal', lineHeight: 'snug', family: 'mono', color: 'secondary' },
  'mono-xs': { size: '2xs', weight: 'normal', lineHeight: 'tight', family: 'mono', color: 'secondary' },
  
  // Colored monospace for different data types
  'mono-primary': { size: 'sm', weight: 'medium', lineHeight: 'normal', family: 'mono', color: 'primary' },
  'mono-success': { size: 'sm', weight: 'medium', lineHeight: 'normal', family: 'mono', color: 'success' },
  'mono-warning': { size: 'sm', weight: 'medium', lineHeight: 'normal', family: 'mono', color: 'warning' },
  'mono-danger': { size: 'sm', weight: 'medium', lineHeight: 'normal', family: 'mono', color: 'danger' },
  
  // Lead text
  lead: { size: 'base', weight: 'medium', lineHeight: 'relaxed', color: 'secondary' },
  
  // Value variants for metrics/data
  value: { size: 'lg', weight: 'bold', lineHeight: 'tight', color: 'primary' },
  'value-sm': { size: 'base', weight: 'semibold', lineHeight: 'tight', color: 'primary' },
  'value-lg': { size: 'xl', weight: 'bold', lineHeight: 'tight', color: 'primary' },
  
  // Unit variants for measurement units
  unit: { size: 'xs', weight: 'medium', lineHeight: 'tight', color: 'muted' },
  'unit-muted': { size: '2xs', weight: 'medium', lineHeight: 'tight', color: 'muted' },
  'unit-accent': { size: 'xs', weight: 'semibold', lineHeight: 'tight', color: 'secondary' },
  
  // Status variants for system states
  'status-good': { size: 'xs', weight: 'medium', lineHeight: 'tight', color: 'success' },
  'status-warning': { size: 'xs', weight: 'medium', lineHeight: 'tight', color: 'warning' },
  'status-error': { size: 'xs', weight: 'medium', lineHeight: 'tight', color: 'danger' },
  'status-neutral': { size: 'xs', weight: 'medium', lineHeight: 'tight', color: 'muted' }
} as const

// Font family classes
export const fontFamilyClasses = {
  sans: 'font-sans',
  serif: 'font-serif', 
  mono: 'font-mono'
}

// Size classes
export const sizeClasses = {
  '2xs': 'text-2xs',
  xs: 'text-xs',
  sm: 'text-sm', 
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl'
}

// Line height classes
export const lineHeightClasses = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug', 
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose'
}

// Letter spacing classes
export const trackingClasses = {
  tighter: 'tracking-tighter',
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest'
}

// Utility function to get variant-aware typography classes
export const getVariantClasses = (variant?: TypographyVariant, overrideColor?: BaseTypographyProps['color']) => {
  if (!variant || variant === 'base') return ''
  
  const config = variantStyles[variant]
  if (!config) return ''
  
  const colorToUse = overrideColor || config.color
  const classes = cn(
    config.size && sizeClasses[config.size],
    config.weight && weightClasses[config.weight],
    config.lineHeight && lineHeightClasses[config.lineHeight],
    config.tracking && trackingClasses[config.tracking],
    config.family && fontFamilyClasses[config.family],
    config.uppercase && 'uppercase',
    colorToUse && colorClasses[colorToUse]
  )
  
  return classes
}

// Utility function to get common typography classes
export const getCommonTypographyClasses = (
  color: BaseTypographyProps['color'] = 'primary',
  weight?: BaseTypographyProps['weight'],
  align: BaseTypographyProps['align'] = 'left',
  className?: string
) => {
  return cn(
    colorClasses[color],
    weight && weightClasses[weight],
    alignClasses[align],
    className
  )
}
