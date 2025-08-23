/**
 * @fileoverview Data Manager Connector for Class Components
 * @author Privacy Hub Dashboard
 * 
 * This provides a way to connect class components to the data manager
 * without using hooks. Components can subscribe to updates and get
 * current data state.
 */

import React, { Component } from 'react';
import { dataManager, DataState } from './DataManager';

/**
 * Higher-order component to connect class components to data manager
 */
export function withDataManager<P extends object>(
  WrappedComponent: any
) {
  return class DataManagerConnector extends Component<P, DataManagerConnectorState> {
    private unsubscribe?: () => void;

    constructor(props: P) {
      super(props);
      this.state = {
        data: dataManager.getData(),
        isLoading: false,  // Start with false - show UI immediately
        hasErrors: false,
        stats: dataManager.getStats()
      };
    }

    componentDidMount() {
      // Subscribe to data manager updates
      this.unsubscribe = dataManager.subscribe((updates) => {
        this.setState(prevState => ({
          data: { ...prevState.data, ...updates },
          hasErrors: Object.values({ ...prevState.data.errors, ...updates.errors || {} })
            .some(error => error !== undefined),
          stats: dataManager.getStats()
        }));

        // UI already shows - no need to block on data loading
      });

      // Start data manager if not already running (non-blocking)
      if (!dataManager.getStats().isRunning) {
        dataManager.start(); // Don't wait for this
      }
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }

    refresh = async () => {
      await dataManager.refresh();
    };

    render() {
      const dataManagerProps: DataManagerProps = {
        data: this.state.data,
        isLoading: this.state.isLoading,
        hasErrors: this.state.hasErrors,
        errors: this.state.data.errors,
        services: this.state.data.services,
        stats: this.state.stats,
        refresh: this.refresh
      };

      return React.createElement(WrappedComponent, { ...this.props, ...dataManagerProps });
    }
  };
}

/**
 * Props that will be injected into wrapped components
 */
export interface DataManagerProps {
  data: DataState;
  isLoading: boolean;
  hasErrors: boolean;
  errors: DataState['errors'];
  services: DataState['services'];
  stats: ReturnType<typeof dataManager.getStats>;
  refresh: () => Promise<void>;
}

interface DataManagerConnectorState {
  data: DataState;
  isLoading: boolean;
  hasErrors: boolean;
  stats: ReturnType<typeof dataManager.getStats>;
}

/**
 * Base class that components can extend to get data manager access
 */
export abstract class DataManagerComponent<P = {}, S = {}> extends Component<P, S & DataManagerConnectorState> {
  private unsubscribe?: () => void;

  constructor(props: P) {
    super(props);
    // @ts-ignore - We'll override this in the child class
    this.state = {
      ...this.state,
      data: dataManager.getData(),
      isLoading: false,  // Start with false - show UI immediately
      hasErrors: false,
      stats: dataManager.getStats()
    } as S & DataManagerConnectorState;
  }

  componentDidMount() {
    // Subscribe to data manager updates
    this.unsubscribe = dataManager.subscribe((updates) => {
      this.setState(prevState => ({
        ...prevState,
        data: { ...prevState.data, ...updates },
        hasErrors: Object.values({ ...prevState.data.errors, ...updates.errors || {} })
          .some(error => error !== undefined),
        stats: dataManager.getStats()
      }));

      // Mark initial load as complete once we have any data
      if (this.state.isLoading && Object.values(updates).some(v => v !== null && v !== undefined)) {
        this.setState({ isLoading: false } as any);
      }
    });

    // Start data manager if not already running (non-blocking)
    if (!dataManager.getStats().isRunning) {
      dataManager.start(); // Don't wait for this
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

  }

  protected refresh = async () => {
    await dataManager.refresh();
  };

  protected getDataSlice<T extends keyof DataState>(slice: T): {
    data: DataState[T];
    isLoading: boolean;
    error?: string;
    lastUpdated: number;
  } {
    const data = this.state.data[slice];
    const error = slice in this.state.data.errors ? 
      this.state.data.errors[slice as keyof DataState['errors']] : undefined;
    const lastUpdated = slice in this.state.data.lastUpdated ? 
      this.state.data.lastUpdated[slice as keyof DataState['lastUpdated']] : 0;

    return {
      data,
      isLoading: this.state.isLoading && lastUpdated === 0,
      error,
      lastUpdated
    };
  }
}