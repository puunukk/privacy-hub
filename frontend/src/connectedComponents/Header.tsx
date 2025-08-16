import { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from '@reduxjs/toolkit'
import { Sun, Moon, Monitor, Settings } from 'lucide-react'

import { Button } from '../components/ui/Button'
import { Dropdown } from '../components/ui/Dropdown'
import { SystemActionsModal } from '../components/ui/Modal'
import { Typography } from '../components/ui/Typography'
import CpuTemperature from '../components/CpuTemperature'
import { SystemActionTypes } from '../sagas/system/types'
import type { RootState } from '../store'
import { cn } from '../utils/cn'

interface HeaderProps {
  isLoading: boolean
  theme: 'light' | 'dark' | 'auto'
  dispatch: Dispatch
}

interface HeaderState {
  showSystemActionsModal: boolean
}

class Header extends Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props)
    this.state = {
      showSystemActionsModal: false
    }
  }



  // Modal management methods
  showSystemActionsModal = () => {
    this.setState({ showSystemActionsModal: true })
  }

  hideSystemActionsModal = () => {
    this.setState({ showSystemActionsModal: false })
  }

  handleShutdown = () => {
    const { dispatch } = this.props
    dispatch({ type: SystemActionTypes.SYSTEM_SHUTDOWN_REQUEST })
    this.hideSystemActionsModal()
  }

  handleReboot = () => {
    const { dispatch } = this.props
    dispatch({ type: SystemActionTypes.SYSTEM_REBOOT_REQUEST })
    this.hideSystemActionsModal()
  }

  handleForceShutdown = () => {
    const { dispatch } = this.props
    dispatch({ type: SystemActionTypes.SYSTEM_FORCE_SHUTDOWN_REQUEST })
    this.hideSystemActionsModal()
  }

  setTheme = (theme: 'light' | 'dark' | 'auto') => {
    const { dispatch } = this.props
    dispatch({ type: 'SET_THEME', payload: { theme } })
  }

  // Dropdown menu items
  getDropdownItems = () => {
    const { theme } = this.props

    return [
      {
        id: 'theme-light',
        label: 'Light Theme',
        icon: <Sun className="h-4 w-4" />,
        onClick: () => this.setTheme('light'),
        disabled: theme === 'light'
      },
      {
        id: 'theme-dark',
        label: 'Dark Theme',
        icon: <Moon className="h-4 w-4" />,
        onClick: () => this.setTheme('dark'),
        disabled: theme === 'dark'
      },
      {
        id: 'theme-auto',
        label: 'Auto Theme',
        icon: <Monitor className="h-4 w-4" />,
        onClick: () => this.setTheme('auto'),
        disabled: theme === 'auto'
      },
      {
        id: 'divider-1',
        label: '---',
        icon: null,
        onClick: () => { },
        disabled: true
      },
      {
        id: 'system-actions',
        label: 'System Actions',
        icon: <Settings className="h-4 w-4" />,
        onClick: this.showSystemActionsModal,
        variant: 'warning' as const
      }
    ]
  }

  render() {
    const { isLoading } = this.props
    const { showSystemActionsModal } = this.state

    const headerBackground = cn(
      //'bg-white dark:bg-gray-800', // Default background
      //'border-b border-gray-200 dark:border-gray-700', // Border
      //'shadow-sm', // Shadow
      'transition-colors', // Transition
    );

    return (
      <>
        <header className={headerBackground}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className={cn('flex items-center space-x-3')}>
                {/* <Server className="h-8 w-8 text-blue-600 dark:text-blue-400" /> */}
                <div>
                  <Typography.Title level={2} color="primary">
                    Private Hub
                  </Typography.Title>
                  <Typography.Text size="sm" color="muted">
                    Pi-hole & SearXNG Management
                  </Typography.Text>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* CPU Temperature Monitor */}
                <CpuTemperature size="sm" />

                {/* Actions Dropdown */}
                <Dropdown
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      title="System actions and settings"
                      className="!p-2"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  }
                  items={this.getDropdownItems()}
                />
              </div>
            </div>
          </div>
        </header>

        {/* System Actions Modal */}
        <SystemActionsModal
          isOpen={showSystemActionsModal}
          onClose={this.hideSystemActionsModal}
          onShutdown={this.handleShutdown}
          onReboot={this.handleReboot}
          onForceShutdown={this.handleForceShutdown}
          isLoading={isLoading}
        />
      </>
    )
  }
}

// Redux connection
const mapStateToProps = (state: RootState) => ({
  isLoading: state.appConfig.status === 'LOADING',
  theme: state.appConfig.theme
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)