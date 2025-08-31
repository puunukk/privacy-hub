import { PureComponent } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Settings, Terminal } from 'lucide-react'
import { Dispatch } from '@reduxjs/toolkit'

import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import SystemActionsModal from '@/components/dashboard/SystemActionsModal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

import { cn } from '@/utils/cn'
import { selectTheme } from '@/store/appConfig/selectors/selectTheme'
import { AppConfigActionTypes, type Theme } from '@/store/appConfig/types'
import type { RootState } from '@/store'
import { selectIsDarkTheme } from '@/store/appConfig/selectors/selectIsDarkTheme'
import { SystemInfo } from '@/types/systemInfo'



const mapStateToProps = (state: RootState) => ({
  systemInfo: state.systemInfo?.data || null,
  isLoading: state.systemInfo?.status === 'LOADING',
  currentTheme: selectTheme(state),
  isDarkMode: selectIsDarkTheme(state)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onThemeChange: (theme: Theme) => {
    dispatch({
      type: AppConfigActionTypes.SET_THEME,
      payload: { theme }
    })
  }
})


interface HeaderProps {
  systemInfo: SystemInfo | null
  isLoading: boolean
  isDarkMode: boolean
}

interface HeaderState {
  showSystemModal: boolean
}

type Props = ConnectedProps<typeof connector> & HeaderProps

class Header extends PureComponent<Props, HeaderState> {

  state: HeaderState = {
    showSystemModal: false
  }

  private openSystemModal = () => {
    this.setState({ showSystemModal: true })
  }

  private closeSystemModal = () => {
    this.setState({ showSystemModal: false })
  }

  render() {
    const { systemInfo, isLoading, currentTheme, isDarkMode } = this.props

    const headerStyle = cn(
      'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm', // Default background
      'border-b border-gray-200 dark:border-gray-700', // Border
      //'shadow-sm', // Shadow
      'sticky top-0 z-40',
      'transition-colors', // Transition
    );

    return (
      <>
        {/* Main Application Header */}
        <header className={headerStyle}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="animate-fade-in">
                <Typography.Text color="muted" className="text-sm">
                  {isLoading ? (
                    'Loading system information...'
                  ) : systemInfo?.ip && systemInfo?.uptime ? (
                    `${systemInfo.ip} • Uptime: ${systemInfo.uptime}`
                  ) : (
                    'Management Dashboard'
                  )}
                </Typography.Text>
                <Typography.Title level={1} weight="bold" className="text-2xl">
                  {systemInfo?.hostname || 'Privacy Hub'}
                </Typography.Title>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={this.openSystemModal}
                  variant="ghost"
                  size="md"
                  className="flex flex-col items-center space-x-2 transform transition-all duration-200"
                >
                  <Terminal className="w-4 h-4 m-0" />
                  <Typography.Text weight="medium" color="muted">Cmd</Typography.Text>
                </Button>

                <ThemeToggle
                  isDarkMode={isDarkMode}
                  currentTheme={currentTheme}
                  onThemeChange={this.props.onThemeChange}
                />
              </div>
            </div>
          </div>
        </header>

        {/* System Actions Modal */}
        {this.state.showSystemModal && (
          <SystemActionsModal
            isOpen={this.state.showSystemModal}
            onClose={this.closeSystemModal}
            hostname={systemInfo?.hostname}
          />
        )}
      </>
    )
  }
}
const connector = connect(mapStateToProps, mapDispatchToProps)

// export default connector(withTranslation()(Header))
export default connector(Header)
