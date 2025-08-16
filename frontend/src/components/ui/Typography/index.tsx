import { Title } from './Title'
import { Text } from './Text'
import { Paragraph } from './Paragraph'

// Export subcomponents as properties of Typography
export const Typography = {
    Title,
    Text,
    Paragraph
}

// Also export individual components for direct imports if needed
export { Title, Text, Paragraph }

// Export types
export type { BaseTypographyProps } from './Typography'
