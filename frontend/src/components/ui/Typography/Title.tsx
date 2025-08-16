import { cn } from '@/utils/cn'
import { BaseTypography } from './Typography'
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

export class Title extends BaseTypography<TitleProps> {
    render() {
        const { level = 2, children } = this.props
        const Component = `h${level}` as keyof JSX.IntrinsicElements

        const classes = cn(
            titleSizeClasses[level],
            this.getCommonClasses()
        )

        return (
            <Component className={classes}>
                {children}
            </Component>
        )
    }
}
