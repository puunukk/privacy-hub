import { BaseTypography, type BaseTypographyProps } from './Typography'
import { cn } from '../../../utils/cn'

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

export class Text extends BaseTypography<TextProps> {
    render() {
        const { size = 'sm', as = 'span', children } = this.props
        const Component = as

        const classes = cn(
            textSizeClasses[size],
            this.getCommonClasses()
        )

        return (
            <Component className={classes}>
                {children}
            </Component>
        )
    }
}
