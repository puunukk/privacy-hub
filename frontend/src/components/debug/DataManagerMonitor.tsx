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

import { DataManagerComponent } from '@/api/DataManagerConnector';
import { Activity, AlertCircle, CheckCircle, Clock, Settings, XCircle } from 'lucide-react';

interface DataManagerMonitorProps {
  className?: string;
}

interface DataManagerMonitorState {
  showDetails: boolean;
}

export class DataManagerMonitor extends DataManagerComponent<DataManagerMonitorProps, DataManagerMonitorState> {
  constructor(props: DataManagerMonitorProps) {
    super(props);
    this.state = {
      ...this.state,
      showDetails: false
    };
  }

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
    if (this.state.hasErrors) return 'border-red-500 bg-red-50';
    if (this.state.isLoading) return 'border-yellow-500 bg-yellow-50';
    return 'border-green-500 bg-green-50';
  };

  render() {
    const { data, hasErrors, stats } = this.state;
    const { className = '' } = this.props;
    const { errors, services } = data;

    return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${this.getStatusColor()} ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Data Manager Monitor
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              stats.isRunning 
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
                  <span className="text-xs">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Timers */}
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Timers</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.activeTimers}
            </div>
          </div>

          {/* Subscribers */}
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subscribers</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.subscribers}
            </div>
          </div>

          {/* Errors */}
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Errors</div>
            <div className="flex items-center justify-center gap-1">
              {hasErrors ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="text-sm">
                {Object.values(errors).filter(Boolean).length}
              </span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {Object.entries(data.lastUpdated).map(([key, timestamp]) => (
            <div key={key} className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="capitalize">{key}:</span>
              <span className="text-gray-600 dark:text-gray-400">
                {this.formatTimestamp(timestamp)}
              </span>
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
              <h4 className="font-medium text-gray-900 dark:text-white">Configuration</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {Object.entries(stats.config.intervals).map(([key, interval]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
                  <span className="text-gray-600 dark:text-gray-400">{interval}ms</span>
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
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Data Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>Containers: <span className="font-mono">{data.containers.length}</span></div>
              <div>Docker Info: <span className="font-mono">{data.dockerInfo ? 'Available' : 'None'}</span></div>
              <div>System Metrics: <span className="font-mono">{data.systemMetrics ? 'Available' : 'None'}</span></div>
              <div>System Info: <span className="font-mono">{data.systemInfo ? 'Available' : 'None'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  }
}