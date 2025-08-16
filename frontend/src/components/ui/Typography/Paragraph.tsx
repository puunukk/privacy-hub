import { BaseTypography, BaseTypographyProps } from './Typography'
import { cn } from '../../../utils/cn'

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

export class Paragraph extends BaseTypography<ParagraphProps> {
    render() {
        const { size = 'base', spacing = 'normal', children } = this.props

        const classes = cn(
            paragraphSizeClasses[size],
            paragraphSpacingClasses[spacing],
            this.getCommonClasses()
        )

        return (
            <p className={classes}>
                {children}
            </p>
        )
    }
}
