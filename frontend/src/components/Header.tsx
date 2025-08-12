import { Component } from 'react'
import { Server, Sun, Moon } from 'lucide-react'
import { Button } from './ui/Button'
import { withSystemRedux } from '../store/hoc/withRedux'
import type { SystemReduxProps } from '../store/hoc/withRedux'
import { SystemActionTypes } from '../store/actions/types'

interface HeaderProps extends SystemReduxProps {}

interface HeaderState {}

class HeaderBase extends Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props)
    this.state = {}
  }

  toggleTheme = () => {
    const { theme, dispatch } = this.props
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    dispatch({ type: SystemActionTypes.SET_THEME, payload: { theme: newTheme } })
  }

  render() {
    const { theme } = this.props
    const isDark = theme === 'dark'

    return (
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Server className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Private Hub Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pi-hole & SearXNG Management
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={this.toggleTheme}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                className="!p-2"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>
    )
  }
}

export const Header = withSystemRedux(HeaderBase)