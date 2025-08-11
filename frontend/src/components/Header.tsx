import { Component } from 'react'
import { Server, RefreshCw, Sun, Moon } from 'lucide-react'
import { Button } from './ui/Button'

interface HeaderProps {
  onRefresh: () => void
}

interface HeaderState {
  isDark: boolean
}

export class Header extends Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props)
    this.state = {
      isDark: document.documentElement.classList.contains('dark')
    }
  }

  toggleTheme = () => {
    const { isDark } = this.state
    const newIsDark = !isDark
    
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    
    this.setState({ isDark: newIsDark })
  }

  componentDidMount() {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemDark)
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
      this.setState({ isDark: true })
    }
  }

  render() {
    const { onRefresh } = this.props
    const { isDark } = this.state

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
              
              <Button
                variant="primary"
                size="md"
                onClick={onRefresh}
                className="!flex !items-center !space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
    )
  }
}