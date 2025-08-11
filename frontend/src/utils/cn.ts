/**
 * Simple utility for conditional className concatenation
 * 
 * @param classes - Array of class strings or conditional objects
 * @returns Combined className string
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500')
 * // => 'px-4 py-2 bg-blue-500'
 * 
 * // With conditional classes
 * cn('px-4 py-2', isActive && 'bg-blue-500', !isActive && 'bg-gray-300')
 * ```
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}