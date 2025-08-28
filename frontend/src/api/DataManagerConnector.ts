/**
 * @fileoverview Data Manager Connector for Class Components
 * @author Privacy Hub Dashboard
 * 
 * This provides backward compatibility by mapping Redux state to the old
 * DataManager interface that existing components expect.
 */

import { connect } from 'react-redux';
import { Dispatch } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { Component } from 'react';
import { ContainerActionTypes } from '@/store/docker/types';
import { MetricsActionTypes } from '@/store/metrics/types';
import { SystemInfoActionTypes } from '@/store/systemInfo/types';

// Data structure that matches the old DataManager interface
export interface DataState {
  containers: any[];
  dockerInfo: any;
  dockerNetworks: any[];
  systemMetrics: any;
  systemInfo: any;
  services: {
    docker: boolean;
    backend: boolean;
    pihole: boolean;
  };
  lastUpdated: {
    containers: number;
    dockerInfo: number;
    dockerNetworks: number;
    systemMetrics: number;
    systemInfo: number;
  };
  errors: {
    containers?: string;
    dockerInfo?: string;
    dockerNetworks?: string;
    systemMetrics?: string;
    systemInfo?: string;
  };
}

export interface DataManagerProps {
  data: DataState;
  isLoading: boolean;
  hasErrors: boolean;
  errors: DataState['errors'];
  services: DataState['services'];
  stats: any;
  refresh: () => Promise<void>;
  dispatch: Dispatch;
}

/**
 * Map Redux state to the old DataManager interface
 */
const mapStateToDataManager = (state: RootState): Omit<DataManagerProps, 'refresh' | 'dispatch'> => {
  // Extract data from Redux store slices
  const containers = state.containers?.containers || [];
  const dockerInfo = state.containers?.dockerInfo || null;
  const systemMetrics = state.metrics?.data || null;
  const systemInfo = state.systemInfo?.data || null;

  // Map loading states
  const isContainersLoading = state.containers?.isLoading || false;
  const isMetricsLoading = state.metrics?.status === 'LOADING';
  const isSystemLoading = state.systemInfo?.status === 'LOADING';
  const isLoading = isContainersLoading || isMetricsLoading || isSystemLoading;

  // Map error states
  const errors = {
    containers: state.containers?.error || undefined,
    systemMetrics: state.metrics?.error || undefined,
    systemInfo: state.systemInfo?.error || undefined,
    dockerInfo: state.containers?.error || undefined,
    dockerNetworks: undefined
  };

  const hasErrors = Object.values(errors).some(error => error !== undefined);

  // Mock services for now (health check will update this)
  const services = {
    docker: containers.length > 0 || dockerInfo !== null,
    backend: systemMetrics !== null || systemInfo !== null,
    pihole: false // Will be updated by health check
  };

  // Mock last updated times
  const lastUpdated = {
    containers: state.containers?.lastUpdateTime || 0,
    dockerInfo: state.containers?.lastUpdateTime || 0,
    systemMetrics: state.metrics?.lastUpdated || 0,
    systemInfo: state.systemInfo?.lastUpdated || 0,
    dockerNetworks: 0
  };

  // Construct the data object that matches old interface
  const data: DataState = {
    containers,
    dockerInfo,
    dockerNetworks: [],
    systemMetrics,
    systemInfo,
    services,
    lastUpdated,
    errors
  };

  return {
    data,
    isLoading,
    hasErrors,
    errors,
    services,
    stats: {
      isRunning: true, // UnifiedLoopManager is running
      activeTimers: 0,
      config: { intervals: {} },
      lastUpdated,
      errors,
      subscribers: 0
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch,
  refresh: async () => {
    dispatch({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST });
    dispatch({ type: MetricsActionTypes.FETCH_METRICS_REQUEST });
    dispatch({ type: SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST });
    dispatch({ type: ContainerActionTypes.FETCH_DOCKER_INFO_REQUEST });
  }
});

/**
 * HOC to connect any component to the data
 */
export const connectDataManager = connect(mapStateToDataManager, mapDispatchToProps);

/**
 * Base class that components can extend to get Redux data access
 * NOTE: Components extending this MUST be wrapped with connectDataManager()
 */
export abstract class DataManagerComponent<P = {}, S = {}> extends Component<P & DataManagerProps, S> {

  componentDidMount() {
    // Refresh data on mount - trigger loops to start fetching
    this.refresh();
  }

  protected refresh = async () => {
    // Trigger manual refresh of all data
    const { dispatch } = this.props;
    
    // Dispatch actions to trigger immediate data fetching
    dispatch({ type: ContainerActionTypes.FETCH_CONTAINERS_REQUEST });
    dispatch({ type: MetricsActionTypes.FETCH_METRICS_REQUEST });
    dispatch({ type: SystemInfoActionTypes.FETCH_SYSTEM_INFO_REQUEST });
    dispatch({ type: ContainerActionTypes.FETCH_DOCKER_INFO_REQUEST });
  };

  protected getDataSlice<T extends keyof DataState>(slice: T): {
    data: DataState[T];
    isLoading: boolean;
    error?: string;
    lastUpdated: number;
  } {
    const { data, errors, isLoading } = this.props;
    const sliceData = data[slice];
    const error = errors[slice as keyof DataState['errors']];
    const lastUpdated = data.lastUpdated[slice as keyof DataState['lastUpdated']] || 0;

    return {
      data: sliceData,
      isLoading: isLoading && lastUpdated === 0,
      error,
      lastUpdated
    };
  }
}