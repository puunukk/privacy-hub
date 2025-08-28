import { Component, ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'

interface ToolAction {
  name: string
  description: string
  icon: ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning'
}

interface ToolCardProps {
  id: string
  name: string
  description: string
  icon: ReactNode
  actions?: ToolAction[]
  href?: string
  external?: boolean
}

const toolThemes = {
  searxng: 'bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 border-blue-100 dark:border-blue-800/30',
  pihole: 'bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-900/10 dark:to-rose-900/10 border-red-100 dark:border-red-800/30',
  docker: 'bg-gradient-to-br from-green-50/50 to-lime-50/50 dark:from-green-900/10 dark:to-lime-900/10 border-green-100 dark:border-green-800/30',
  n8n: 'bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10 border-orange-100 dark:border-orange-800/30'
}

const iconThemes = {
  searxng: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  pihole: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  docker: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  n8n: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
}

export class ToolCard extends Component<ToolCardProps> {
  private getTheme = () => {
    return toolThemes[this.props.id as keyof typeof toolThemes] || 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }

  private getIconTheme = () => {
    return iconThemes[this.props.id as keyof typeof iconThemes] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }

  render() {
    const { name, description, icon, actions, href, external } = this.props
    const cardTheme = this.getTheme()
    const iconTheme = this.getIconTheme()

    return (
      <div className={cn("rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200", cardTheme)}>
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={cn("p-3 rounded-lg", iconTheme)}>
            {icon}
          </div>
          <div>
            <Typography.Title level={4} weight="semibold">
              {name}
            </Typography.Title>
            <Typography.Text color="muted" className="text-sm">
              {description}
            </Typography.Text>
          </div>
        </div>

        {/* Actions */}
        {actions && actions.length > 0 ? (
          <div className="space-y-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'ghost'}
                size="sm"
                onClick={action.onClick}
                className="w-full justify-start space-x-2"
              >
                <span className="flex-shrink-0">{action.icon}</span>
                <div className="flex-1 text-left">
                  <Typography.Text weight="medium" className="text-sm">{action.name}</Typography.Text>
                  <Typography.Text color="muted" className="text-xs block">{action.description}</Typography.Text>
                </div>
                {external && (action.name.includes('Interface') || action.name.includes('Panel')) && (
                  <ExternalLink className="w-3 h-3 opacity-50" />
                )}
              </Button>
            ))}
          </div>
        ) : href ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => external ? window.open(href, '_blank') : window.location.href = href}
            className="w-full justify-between"
          >
            <Typography.Text weight="medium">Open {name}</Typography.Text>
            {external && <ExternalLink className="w-4 h-4" />}
          </Button>
        ) : null}
      </div>
    )
  }
}