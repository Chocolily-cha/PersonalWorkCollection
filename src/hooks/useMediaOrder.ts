import { useState, useEffect, useCallback } from 'react';

const KEY_PREFIX = 'portfolioMediaOrder:';
const getStorageKey = (workId: string): string => KEY_PREFIX + workId;

export function useMediaOrder(workId: string, mediaFilenames: string[]) {
  const [order, setOrder] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(getStorageKey(workId));
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setOrder(arr.filter((x) => typeof x === 'string'));
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, [workId]);

  useEffect(() => {
    if (!hydrated || !order.length || !mediaFilenames.length) return;
    const matchCount = order.filter((f) => mediaFilenames.includes(f)).length;
    if (matchCount / order.length < 0.3) {
      try { window.localStorage.removeItem(getStorageKey(workId)); } catch { /* ignore */ }
      setOrder([]);
    }
  }, [hydrated, order, mediaFilenames, workId]);

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
    try {
      window.localStorage.setItem(getStorageKey(workId), JSON.stringify(newOrder));
      return true;
    } catch { return false; }
  }, [workId]);

  const resetOrder = useCallback(() => {
    try { window.localStorage.removeItem(getStorageKey(workId)); } catch { /* ignore */ }
    setOrder([]);
  }, [workId]);

  return { order, hydrated, sortMedia, saveOrder, resetOrder, hasCustomOrder: order.length > 0 };
}
