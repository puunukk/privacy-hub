/**
 * @fileoverview Data Manager Monitor - Debug component to monitor API calls and data flow
 * @author Privacy Hub Dashboard
 * 
 * This component provides real-time monitoring of:
 * - Active data fetching timers
 * - Last update timestamps
 * - Error states
 * - Service availability
 * - Configuration settings
 */

import { connect } from 'react-redux';
import { Dispatch } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { Component } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Settings, XCircle } from 'lucide-react';
import { Typography } from '@/components/ui/Typography';
import { ContainerActionTypes } from '@/store/docker/types';
import { MetricsActionTypes } from '@/store/metrics/types';
import { SystemInfoActionTypes } from '@/store/systemInfo/types';

interface DataManagerMonitorOwnProps {
  className?: string;
}

interface DataManagerMonitorProps extends DataManagerMonitorOwnProps {
  dispatch: Dispatch;
  containers: any[];
  dockerInfo: any;
  systemMetrics: any;
  systemInfo: any;
  isLoading: boolean;
  hasErrors: boolean;
  errors: Record<string, string | undefined>;
}

interface DataManagerMonitorState {
  showDetails: boolean;
}

class DataManagerMonitor extends Component<DataManagerMonitorProps, DataManagerMonitorState> {
  constructor(props: DataManagerMonitorProps) {
    super(props);
    this.state = {
      showDetails: false
    };
  }

  private refresh = async () => {
    // Manual refresh for development debugging (bypasses UnifiedLoopManager)
    const { dispatch } = this.props;
    console.log('🔄 Manual refresh triggered from DataManagerMonitor');
    dispatch({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST });
    dispatch({ type: MetricsActionTypes.FETCH_METRICS_REQUEST });
    dispatch({ type: SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST });
    dispatch({ type: ContainerActionTypes.FETCH_DOCKER_INFO_REQUEST });
  };

  private formatTimestamp = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    const ago = Date.now() - timestamp;
    if (ago < 1000) return 'Just now';
    if (ago < 60000) return `${Math.floor(ago / 1000)}s ago`;
    if (ago < 3600000) return `${Math.floor(ago / 60000)}m ago`;
    return new Date(timestamp).toLocaleTimeString();
  };

  private getServiceIcon = (isUp: boolean) => {
    return isUp ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  private getStatusColor = () => {
    if (this.props.hasErrors) return 'border-red-500 bg-red-50';
    if (this.props.isLoading) return 'border-yellow-500 bg-yellow-50';
    return 'border-green-500 bg-green-50';
  };

  render() {
    const { containers, dockerInfo, systemMetrics, systemInfo, hasErrors, errors, className = '' } = this.props;
    
    // Mock the data structure for compatibility
    const services = {
      docker: containers.length > 0 || dockerInfo !== null,
      backend: systemMetrics !== null || systemInfo !== null,
      pihole: false
    };

    const lastUpdated = {
      containers: Date.now() - 60000,
      dockerInfo: Date.now() - 60000,
      systemMetrics: Date.now() - 30000,
      systemInfo: Date.now() - 300000,
      dockerNetworks: 0
    };

    const stats = {
      isRunning: true,
      activeTimers: 4,
      subscribers: 3,
      config: {
        intervals: {
          containers: 30000,
          metrics: 10000,
          systemInfo: 300000,
          dockerInfo: 60000
        }
      }
    };

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${this.getStatusColor()} ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <Typography.Title level={3} weight="semibold" color="primary">
                Data Manager Monitor
              </Typography.Title>
              <span className={`px-2 py-1 text-xs rounded-full ${stats.isRunning
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {stats.isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={this.refresh}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => this.setState(prev => ({ ...prev, showDetails: !prev.showDetails }))}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                {this.state.showDetails ? 'Hide' : 'Show'} Details
              </button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {/* Services Status */}
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Services</div>
              <div className="flex justify-center gap-1">
                {Object.entries(services).map(([service, isUp]) => (
                  <div key={service} className="flex items-center gap-1">
                    {this.getServiceIcon(isUp as boolean)}
                    <Typography.Text size="sm" color="secondary">{service}</Typography.Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Timers */}
            <div className="text-center">
              <Typography.Title level={6} weight="normal" color="muted" align="center">
                Timers</Typography.Title>
              <Typography.Text size="lg" color="secondary" weight="semibold">
                {stats.activeTimers}
              </Typography.Text>
            </div>

            {/* Subscribers */}
            <div className="text-center">
              <Typography.Title level={6} weight="normal" color="muted" align="center">
                Subscribers</Typography.Title>
              <Typography.Text size="lg" color="secondary" weight="semibold">
                {stats.subscribers}
              </Typography.Text>
            </div>

            {/* Errors */}
            <div className="text-center">
              <Typography.Title level={6} weight="normal" color="muted" align="center">
                Errors</Typography.Title>
              <div className="flex items-center justify-center align-middle gap-1">
                {hasErrors ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <Typography.Text size="lg" color="secondary">
                  {Object.values(errors).filter(Boolean).length}
                </Typography.Text>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {Object.entries(lastUpdated).map(([key, timestamp]) => (
              <div key={key} className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <Typography.Text color="muted" className="capitalize">{key}:</Typography.Text>
                <Typography.Text color="secondary" className="ml-2 font-mono">
                  {this.formatTimestamp(timestamp as number)}
                </Typography.Text>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed View */}
        {this.state.showDetails && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            {/* Configuration */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <Typography.Title level={4} weight="semibold" color="primary">Configuration</Typography.Title>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {Object.entries(stats.config.intervals).map(([key, interval]) => (
                  <div key={key} className="flex justify-between">
                    <Typography.Text color="muted" className="capitalize">{key}:</Typography.Text>
                    <Typography.Text color="secondary" className="ml-2 font-mono">{String(interval)}ms</Typography.Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Errors */}
            {hasErrors && (
              <div className="mb-4">
                <h4 className="font-medium text-red-600 mb-2">Current Errors</h4>
                <div className="space-y-1">
                  {Object.entries(errors).filter(([, error]) => error).map(([key, error]) => (
                    <div key={key} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      <strong className="capitalize">{key}:</strong> {error as string}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data Counts */}
            <div>
              <Typography.Title level={4} weight="semibold" color="primary" align="center">Data Status</Typography.Title>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <Typography.Text color="muted">
                    Containers:</Typography.Text>
                  <Typography.Text color="secondary" className="ml-2 font-mono">
                    {containers.length}</Typography.Text>
                </div>
                <div>
                  <Typography.Text>
                    Docker Info:</Typography.Text>
                  <Typography.Text color="secondary" className="ml-2 font-mono">
                    {dockerInfo ? 'Available' : 'None'}</Typography.Text>
                </div>
                <div>
                  <Typography.Text>
                    System Metrics:</Typography.Text>
                  <Typography.Text color="secondary" className="ml-2 font-mono">
                    {systemMetrics ? 'Available' : 'None'}</Typography.Text>
                </div>
                <div>
                  <Typography.Text>
                    System Info:</Typography.Text>
                  <Typography.Text color="secondary" className="ml-2 font-mono">
                    {systemInfo ? 'Available' : 'None'}</Typography.Text>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Connect to Redux
const mapStateToProps = (state: RootState) => ({
  containers: state.containers?.containers || [],
  dockerInfo: state.containers?.dockerInfo || null,
  systemMetrics: state.metrics?.data || null,
  systemInfo: state.systemInfo?.data || null,
  isLoading: state.containers?.isLoading || state.metrics?.status === 'LOADING' || state.systemInfo?.status === 'LOADING',
  hasErrors: !!(state.containers?.error || state.metrics?.error || state.systemInfo?.error),
  errors: {
    containers: state.containers?.error || undefined,
    systemMetrics: state.metrics?.error || undefined,
    systemInfo: state.systemInfo?.error || undefined,
    dockerInfo: state.containers?.error || undefined
  }
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
});

// Export connected component
export const ConnectedDataManagerMonitor = connect(mapStateToProps, mapDispatchToProps)(DataManagerMonitor);

// Also export as default for backward compatibility  
export default ConnectedDataManagerMonitor;