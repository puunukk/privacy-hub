import { PureComponent, ReactNode, createRef } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from './Button'
import { Typography } from './Typography'
import { cn } from '@/utils/cn'
import type { Theme } from '@/store/appConfig/types'

interface ThemeOption {
  label: string
  icon?: ReactNode
  tooltip?: string
}

type ThemeOptions = Record<Theme, ThemeOption>

const themeOptions: ThemeOptions = {
  light: {
    label: 'Light',
    icon: <Sun className="h-4 w-4" />,
    tooltip: 'Light mode'
  },
  dark: {
    label: 'Dark',
    icon: <Moon className="h-4 w-4" />,
    tooltip: 'Dark mode'
  },
  auto: {
    label: 'Auto',
    icon: <Monitor className="h-4 w-4" />,
    tooltip: 'System preference'
  }
}

interface ThemeToggleProps {
  currentTheme: Theme
  onThemeChange: (theme: Theme) => void
  variant?: 'icon' | 'dropdown' | 'tabs'
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  isDarkMode?: boolean
}

interface ThemeToggleState {
  isOpen: boolean
}

export class ThemeToggle extends PureComponent<ThemeToggleProps, ThemeToggleState> {

  private dropdownRef = createRef<HTMLDivElement>()

  state: ThemeToggleState = {
    isOpen: false
  }


  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  }

  handleOutsideClick = (event: MouseEvent) => {
    if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target as Node)) {
      this.setState({ isOpen: false })
    }
  }

  toggleDropdown = () => {
    this.setState(prev => ({ isOpen: !prev.isOpen }))
  }

  handleThemeSelect = (theme: Theme) => {
    this.props.onThemeChange(theme)
    this.setState({ isOpen: false })
  }

  getCurrentThemeOption = (): ThemeOption => {
    return themeOptions[this.props.currentTheme]
  }

  renderIconVariant = () => {
    const { size = 'md' } = this.props
    const currentOption = this.getCurrentThemeOption()

    return (
      <Button
        variant="ghost"
        size={size}
        onClick={this.toggleDropdown}
        className="p-2"
        aria-label={currentOption.tooltip}
        title={currentOption.tooltip}
      >
        {currentOption.icon}
      </Button>
    )
  }

  renderDropdownVariant = () => {
    const { size = 'md', showLabels = true, currentTheme, isDarkMode } = this.props
    const { isOpen } = this.state
    const currentOption = this.getCurrentThemeOption()

    return (
      <div className="relative" ref={this.dropdownRef}>
        <Button
          variant="ghost"
          size={size}
          onClick={this.toggleDropdown}
          className="flex flex-col justify-center items-center px-3"
          aria-label="Theme selector"
          aria-expanded={isOpen}
        >
          {/*isDarkMode ? currentOption.icon : <Sun className="h-4 w-4" />*/}
          {isDarkMode ? <Moon className="h-4 w-4 m-0" /> : <Sun className="h-4 w-4 m-0" />}
          {showLabels && (
            <Typography.Text size="sm" color="muted">
              {currentOption.label}</Typography.Text>
          )}
        </Button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
            {Object.entries(themeOptions).map(([themeKey, option]) => {
              const theme = themeKey as Theme
              const isSelected = theme === currentTheme

              return (
                <button
                  key={theme}
                  onClick={() => this.handleThemeSelect(theme)}
                  className={cn(
                    "w-full px-3 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                    isSelected && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  title={option.tooltip}
                >
                  <div className={cn(
                    isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <Typography.Text
                      weight={isSelected ? "medium" : "normal"}
                      color={isSelected ? "info" : "primary"}
                    >
                      {option.label}
                    </Typography.Text>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  renderTabsVariant = () => {
    const { currentTheme } = this.props

    return (
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {Object.entries(themeOptions).map(([themeKey, option]) => {
          const theme = themeKey as Theme
          const isSelected = theme === currentTheme

          return (
            <Button
              key={theme}
              onClick={() => this.handleThemeSelect(theme)}
              className={cn(
                "flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all duration-200",
                "hover:bg-white dark:hover:bg-gray-700",
                isSelected
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              )}
              title={option.tooltip}
            >
              <div className={cn(
                isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
              )}>
                {option.icon}
              </div>
              <Typography.Text
                size="sm"
                weight={isSelected ? "medium" : "normal"}
                color={isSelected ? "info" : "secondary"}
              >
                {option.label}
              </Typography.Text>
            </Button>
          )
        })}
      </div>
    )
  }

  render() {
    const { variant = 'dropdown' } = this.props

    switch (variant) {
      case 'icon':
        return this.renderIconVariant()
      case 'tabs':
        return this.renderTabsVariant()
      case 'dropdown':
      default:
        return this.renderDropdownVariant()
    }
  }
}