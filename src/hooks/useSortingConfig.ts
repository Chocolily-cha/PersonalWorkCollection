'use client';

import { useCallback, useEffect, useState } from 'react';

const CONFIG_PATH = '/PersonalWorkCollection/config/sorting.json';
const LOCAL_STORAGE_KEY = 'portfolioOrder';
const MEDIA_STORAGE_KEY_PREFIX = 'portfolioMediaOrder:';

interface SortingConfig {
  version: number;
  lastUpdated: string;
  description: string;
  workOrder: string[];
  mediaOrder: Record<string, string[]>;
}

interface SortingConfigState {
  config: SortingConfig | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

export function useSortingConfig() {
  const [state, setState] = useState<SortingConfigState>({
    config: null,
    loading: true,
    error: null,
    hydrated: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchConfig = async () => {
      try {
        const response = await fetch(CONFIG_PATH);
        if (!response.ok) {
          throw new Error(`Failed to fetch sorting config: ${response.status}`);
        }
        const config: SortingConfig = await response.json();
        
        if (!config.workOrder || !Array.isArray(config.workOrder)) {
          throw new Error('Invalid sorting config: missing workOrder array');
        }

        setState({
          config,
          loading: false,
          error: null,
          hydrated: true,
        });
      } catch (err) {
        console.warn('[SortingConfig] Failed to load config, using fallback:', err);
        setState({
          config: null,
          loading: false,
          error: (err as Error).message,
          hydrated: true,
        });
      }
    };

    fetchConfig();
  }, []);

  const getWorkOrder = useCallback((): string[] | null => {
    if (typeof window === 'undefined') return null;

    try {
      const localOrder = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localOrder) {
        const parsed = JSON.parse(localOrder);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      console.warn('[SortingConfig] Failed to read localStorage work order');
    }

    if (state.config?.workOrder?.length > 0) {
      return state.config.workOrder;
    }

    return null;
  }, [state.config]);

  const getMediaOrder = useCallback((workId: string): string[] | null => {
    if (typeof window === 'undefined') return null;

    try {
      const localMediaOrder = window.localStorage.getItem(MEDIA_STORAGE_KEY_PREFIX + workId);
      if (localMediaOrder) {
        const parsed = JSON.parse(localMediaOrder);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      console.warn('[SortingConfig] Failed to read localStorage media order for:', workId);
    }

    if (state.config?.mediaOrder?.[workId]?.length > 0) {
      return state.config.mediaOrder[workId];
    }

    return null;
  }, [state.config]);

  const saveWorkOrderToLocalStorage = useCallback((order: string[]): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(order));
      return true;
    } catch {
      console.warn('[SortingConfig] Failed to save work order to localStorage');
      return false;
    }
  }, []);

  const saveMediaOrderToLocalStorage = useCallback((workId: string, order: string[]): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(MEDIA_STORAGE_KEY_PREFIX + workId, JSON.stringify(order));
      return true;
    } catch {
      console.warn('[SortingConfig] Failed to save media order to localStorage');
      return false;
    }
  }, []);

  const clearWorkOrderFromLocalStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      console.warn('[SortingConfig] Failed to clear work order from localStorage');
    }
  }, []);

  const clearMediaOrderFromLocalStorage = useCallback((workId: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(MEDIA_STORAGE_KEY_PREFIX + workId);
    } catch {
      console.warn('[SortingConfig] Failed to clear media order from localStorage');
    }
  }, []);

  const exportConfig = useCallback((
    workOrder: string[],
    mediaOrder: Record<string, string[]>
  ): SortingConfig => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    return {
      version: (state.config?.version || 1) + 1,
      lastUpdated: dateStr,
      description: 'Portfolio sorting configuration - edit in admin mode and download updated config to commit to repo',
      workOrder,
      mediaOrder,
    };
  }, [state.config]);

  const downloadConfig = useCallback((
    workOrder: string[],
    mediaOrder: Record<string, string[]>
  ) => {
    const config = exportConfig(workOrder, mediaOrder);
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sorting.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return config;
  }, [exportConfig]);

  return {
    ...state,
    getWorkOrder,
    getMediaOrder,
    saveWorkOrderToLocalStorage,
    saveMediaOrderToLocalStorage,
    clearWorkOrderFromLocalStorage,
    clearMediaOrderFromLocalStorage,
    exportConfig,
    downloadConfig,
  };
}