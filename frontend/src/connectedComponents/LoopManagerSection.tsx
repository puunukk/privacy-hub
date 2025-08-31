import { PureComponent } from 'react'
import { connect } from 'react-redux'
import {
  Cog, RotateCcw, ChevronDown, ChevronUp,
  Activity,
  Pause,
  Play,
  RefreshCw,
  //Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import type { Dispatch } from '@reduxjs/toolkit'

import { SectionWrapper } from '@/components/ui/SectionWrapper'

import { RootState } from '@/store'
import {
  toggleLoop,
  updateLoopInterval,
  enableAllLoops,
  disableAllLoops,
  resetLoopStats,
  selectAllLoops,
  selectLoopStats
} from '@/store/loops/loopsSlice'

import { LoopManagerActionTypes } from '@/sagas/unifiedLoopManager'
import { DEFAULT_LOOP_CONFIGS } from '@/sagas/unifiedLoopManager'


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

  private handleToggleLoop = (loopId: string) => {
    const { dispatch } = this.props
    dispatch(toggleLoop({ id: loopId }))
    dispatch({ type: LoopManagerActionTypes.TOGGLE_LOOP, payload: { id: loopId } })
  }

  private handleIntervalChange = (loopId: string, interval: number) => {
    const { dispatch } = this.props
    dispatch(updateLoopInterval({ id: loopId, interval }))
    dispatch({
      type: LoopManagerActionTypes.UPDATE_LOOP_INTERVAL,
      payload: { id: loopId, interval }
    })
  }

  private handlePauseAll = () => {
    const { dispatch } = this.props
    dispatch(disableAllLoops())
    dispatch({ type: LoopManagerActionTypes.PAUSE_ALL_LOOPS })
  }

  private handleResumeAll = () => {
    const { dispatch } = this.props
    dispatch(enableAllLoops())
    dispatch({ type: LoopManagerActionTypes.RESUME_ALL_LOOPS })
  }

  private handleResetStats = () => {
    const { dispatch } = this.props
    dispatch(resetLoopStats({}))
  }

  private formatLastRun = (timestamp: number): string => {
    if (!timestamp) return 'Never'
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  render() {
    const { isRunning = true, stats, loops } = this.props
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
        icon={<Cog className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
        actions={actions}
        className="border-t border-gray-200 dark:border-gray-700 pt-8"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">

            <div className="flex items-center space-x-2">
              <button
                onClick={this.handlePauseAll}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <Pause className="h-4 w-4" />
                <span>Pause All</span>
              </button>

              <button
                onClick={this.handleResumeAll}
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <Play className="h-4 w-4" />
                <span>Resume All</span>
              </button>

              <button
                onClick={this.handleResetStats}
                className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                Reset Stats
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Loops</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="text-sm text-green-600 dark:text-green-400">Active</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.enabled}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="text-sm text-blue-600 dark:text-blue-400">Requests/Hour</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {Math.round(stats.requestsPerHour)}
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
              <div className="text-sm text-orange-600 dark:text-orange-400">Errors</div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {stats.errors}
              </div>
            </div>
          </div>

          {/* Loop List */}
          <div className="space-y-4">
            {DEFAULT_LOOP_CONFIGS.map(config => {
              const loop = loops[config.id]
              if (!loop) return null

              const isHealthCheck = config.id === 'health_check'
              const currentInterval = loop.interval

              return (
                <div
                  key={config.id}
                  className={`border rounded-lg p-4 transition-colors ${loop.enabled
                    ? 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {/* Status Icon */}
                        <div className="flex items-center">
                          {loop.status === 'running' ? (
                            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
                          ) : loop.status === 'error' ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        {/* Loop Name */}
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {config.name}
                        </h3>

                        {/* Category Badge */}
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.category === 'system' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                          config.category === 'docker' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            config.category === 'metrics' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                          {config.category}
                        </span>

                        {/* Special indicator for health check */}
                        {isHealthCheck && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full font-medium">
                            Smart Interval
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {config.description}
                      </p>

                      {/* Stats */}
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Last run: {this.formatLastRun(loop.lastRun)}</span>
                        </div>
                        <div>Success: {loop.successCount}</div>
                        <div>Errors: {loop.errorCount}</div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-4">
                      {/* Interval Selector */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Interval:
                        </label>
                        <select
                          value={currentInterval}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === 'custom') {
                              const custom = prompt(`Enter custom interval for ${config.name} (in milliseconds):`, String(currentInterval))
                              if (custom && !isNaN(parseInt(custom))) {
                                const customMs = Math.max(config.minInterval, Math.min(parseInt(custom), config.maxInterval))
                                this.handleIntervalChange(config.id, customMs)
                              }
                            } else {
                              this.handleIntervalChange(config.id, parseInt(value))
                            }
                          }}
                          disabled={!loop.enabled}
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        >
                          {/* Predefined intervals */}
                          {config.id === 'system_metrics' && (
                            <>
                              <option value={1000}>1 second</option>
                              <option value={3000}>3 seconds</option>
                              <option value={5000}>5 seconds</option>
                              <option value={10000}>10 seconds</option>
                              <option value={15000}>15 seconds</option>
                              <option value={30000}>30 seconds</option>
                              <option value="custom">Custom...</option>
                            </>
                          )}
                          {config.id === 'docker_containers' && (
                            <>
                              <option value={5000}>5 seconds</option>
                              <option value={10000}>10 seconds</option>
                              <option value={15000}>15 seconds</option>
                              <option value={30000}>30 seconds</option>
                              <option value={60000}>1 minute</option>
                              <option value="custom">Custom...</option>
                            </>
                          )}
                          {(config.id === 'system_info' || config.id === 'docker_info') && (
                            <>
                              <option value={60000}>1 minute</option>
                              <option value={120000}>2 minutes</option>
                              <option value={300000}>5 minutes</option>
                              <option value={600000}>10 minutes</option>
                              <option value="custom">Custom...</option>
                            </>
                          )}
                          {config.id === 'docker_networks' && (
                            <>
                              <option value={60000}>1 minute</option>
                              <option value={300000}>5 minutes</option>
                              <option value={600000}>10 minutes</option>
                              <option value="custom">Custom...</option>
                            </>
                          )}
                          {config.id === 'health_check' && (
                            <>
                              <option value={30000}>30 seconds (normal)</option>
                              <option value={60000}>1 minute</option>
                              <option value={1000} disabled>1 second (auto when down)</option>
                              <option value="custom">Custom...</option>
                            </>
                          )}
                          {config.id === 'docker_stats' && (
                            <>
                              <option value={10000}>10 seconds</option>
                              <option value={30000}>30 seconds</option>
                              <option value={60000}>1 minute</option>
                              <option value={120000}>2 minutes</option>
                              <option value="custom">Custom...</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => this.handleToggleLoop(config.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${loop.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${loop.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Special note for health check */}
                  {isHealthCheck && (
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
                      <strong>Note:</strong> This loop automatically switches to 1-second interval when services are down,
                      and returns to normal interval when services are restored.
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <RefreshCw className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Loop Management Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>Disable loops you don't need to reduce server load</li>
                  <li>Increase intervals during low-activity periods</li>
                  <li>The health check loop automatically speeds up when services are down</li>
                  <li>Container stats can be heavy - disable if not needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </SectionWrapper>
    )
  }
}

// Redux connection
const mapStateToProps = (state: RootState) => ({
  // Add proper loop status from state when available
  isRunning: true, // This should come from actual loop manager state
  loops: selectAllLoops(state),
  stats: selectLoopStats(state)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
})


export const ConnectedLoopManagerSection = connect(mapStateToProps, mapDispatchToProps)(LoopManagerSection)
export default ConnectedLoopManagerSection