import { useState, useEffect, useCallback } from 'react';
import { useSortingConfig } from '@/hooks/useSortingConfig';

const KEY_PREFIX = 'portfolioMediaOrder:';
const getStorageKey = (workId: string): string => KEY_PREFIX + workId;

export function useMediaOrder(workId: string, mediaFilenames: string[]) {
  const [order, setOrder] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  
  const sortingConfig = useSortingConfig();

  useEffect(() => {
    if (!sortingConfig.hydrated) return;
    
    const savedOrder = sortingConfig.getMediaOrder(workId);
    if (savedOrder && savedOrder.length > 0) {
      setOrder(savedOrder);
    }
    setHydrated(true);
  }, [workId, sortingConfig]);

  useEffect(() => {
    if (!hydrated || !order.length || !mediaFilenames.length) return;
    const matchCount = order.filter((f) => mediaFilenames.includes(f)).length;
    if (matchCount / order.length < 0.3) {
      sortingConfig.clearMediaOrderFromLocalStorage(workId);
      setOrder([]);
    }
  }, [hydrated, order, mediaFilenames, workId, sortingConfig]);

  const sortMedia = useCallback((filenames: string[]): string[] => {
    if (!order.length) return filenames;
    const map = new Map(filenames.map((f) => [f, f]));
    const sorted: string[] = [];
    const seen = new Set<string>();
    for (const f of order) { if (map.has(f)) { sorted.push(f); seen.add(f); } }
    for (const f of filenames) { if (!seen.has(f)) sorted.push(f); }
    return sorted;
  }, [order]);

  const saveOrder = useCallback((newOrder: string[]): boolean => {
    setOrder(newOrder);
    return sortingConfig.saveMediaOrderToLocalStorage(workId, newOrder);
  }, [workId, sortingConfig]);

  const resetOrder = useCallback(() => {
    sortingConfig.clearMediaOrderFromLocalStorage(workId);
    setOrder([]);
  }, [workId, sortingConfig]);

  return { order, hydrated, sortMedia, saveOrder, resetOrder, hasCustomOrder: order.length > 0 };
}
