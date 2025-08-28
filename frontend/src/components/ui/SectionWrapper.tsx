import { Component, ReactNode } from 'react'
import { Typography } from './Typography'
import { Button } from './Button'

interface SectionAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning'
  icon?: ReactNode
}

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  subtitle?: string
  icon?: ReactNode
  actions?: SectionAction[]
  children: ReactNode
  className?: string
  contentClassName?: string
}

export class SectionWrapper extends Component<SectionWrapperProps> {
  render() {
    const {
      title,
      subtitle,
      icon,
      actions,
      children,
      className = '',
      contentClassName = '',
      ...props
    } = this.props

    return (
      <section className={`mb-8 ${className}`} {...props}>
        {/* Section Header */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <Typography.Title level={3} weight="semibold" color="secondary">
                {title}
              </Typography.Title>
              {subtitle && (
                <Typography.Text color="muted" className="text-sm mt-1">
                  {subtitle}
                </Typography.Text>
              )}
            </div>
          </div>

          {/* Section Actions */}
          {actions && actions.length > 0 && (
            <div className="flex items-center space-x-2 flex-wrap">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  onClick={action.onClick}
                  className="flex items-center space-x-1"
                >
                  {action.icon}
                  <Typography.Text className="hidden sm:inline">{action.label}</Typography.Text>
                  <Typography.Text className="sm:hidden">{action.icon ? '' : action.label}</Typography.Text>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Section Content */}
        <div className={contentClassName}>
          {children}
        </div>
      </section>
    )
  }
}