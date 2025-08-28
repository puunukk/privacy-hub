import { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Cog, Pause, Play, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import LoopManager from '@/components/settings/LoopManager'
import { LoopManagerActionTypes } from '@/sagas/unifiedLoopManager'
import type { Dispatch } from '@reduxjs/toolkit'

interface LoopManagerSectionProps {
  isRunning?: boolean
  dispatch: Dispatch
}

interface LoopManagerSectionState {
  showAdvanced: boolean
  isCollapsed: boolean
}

class LoopManagerSection extends PureComponent<LoopManagerSectionProps, LoopManagerSectionState> {
  constructor(props: LoopManagerSectionProps) {
    super(props)
    this.state = {
      showAdvanced: false,
      isCollapsed: true
    }
  }

  private handleToggleLoops = () => {
    const { dispatch } = this.props
    // This would need proper loop status from state
    dispatch({ type: LoopManagerActionTypes.TOGGLE_LOOP, payload: 'all' })
  }

  private handleResetLoops = () => {
    const { dispatch } = this.props
    dispatch({ type: LoopManagerActionTypes.RESUME_ALL_LOOPS })
  }

  private toggleAdvanced = () => {
    this.setState({ showAdvanced: !this.state.showAdvanced })
  }

  private toggleCollapsed = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed })
  }

  render() {
    const { isRunning = true } = this.props
    const { showAdvanced, isCollapsed } = this.state

    const actions = [
      {
        label: isCollapsed ? 'Expand' : 'Collapse',
        onClick: this.toggleCollapsed,
        variant: 'ghost' as const,
        icon: isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
      },
      {
        label: isRunning ? 'Pause All' : 'Start All',
        onClick: this.handleToggleLoops,
        variant: isRunning ? 'warning' as const : 'primary' as const,
        icon: isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />
      },
      {
        label: 'Reset',
        onClick: this.handleResetLoops,
        variant: 'ghost' as const,
        icon: <RotateCcw className="w-4 h-4" />
      },
      {
        label: showAdvanced ? 'Hide Advanced' : 'Advanced',
        onClick: this.toggleAdvanced,
        variant: 'ghost' as const,
        icon: <Cog className="w-4 h-4" />
      }
    ]

    return (
      <SectionWrapper
        title="Loop Manager"
        subtitle="Control background data fetching and updates"
        icon={<Cog className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
        actions={actions}
        className="border-t border-gray-200 dark:border-gray-700 pt-8"
      >
        {!isCollapsed && <LoopManager />}
      </SectionWrapper>
    )
  }
}

const mapStateToProps = () => ({
  // Add proper loop status from state when available
  isRunning: true // This should come from actual loop manager state
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
})

export const ConnectedLoopManagerSection = connect(mapStateToProps, mapDispatchToProps)(LoopManagerSection)