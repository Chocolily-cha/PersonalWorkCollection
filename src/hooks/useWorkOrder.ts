'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Work } from '@/data/types';
import { defaultOrder } from '@/data/defaultOrder';

const STORAGE_KEY = 'portfolioOrder';
const ADMIN_KEY = 'admin';

export function useWorkOrder(works: Work[]) {
  const [order, setOrder] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('edit') === '1' && params.get('key') === ADMIN_KEY;
    setHasAdminAccess(isAdmin);
    if (isAdmin) setEditMode(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setOrder(arr.filter((x) => typeof x === 'string'));
      } else {
        setOrder(defaultOrder);
      }
    } catch {
      setOrder(defaultOrder);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !order.length || !works.length) return;
    const matchCount = order.filter((id) => works.some((w) => w.id === id)).length;
    if (matchCount / order.length < 0.3) {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      setOrder(defaultOrder);
    }
  }, [hydrated, order, works]);

  const sortWorks = useCallback((list: Work[]): Work[] => {
    if (!order.length) return list;
    const map = new Map(list.map((w) => [w.id, w]));
    const sorted: Work[] = [];
    const seen = new Set<string>();
    for (const id of order) {
      const w = map.get(id);
      if (w) { sorted.push(w); seen.add(id); }
    }
    for (const w of list) { if (!seen.has(w.id)) sorted.push(w); }
    return sorted;
  }, [order]);

  const enterEditMode = useCallback(() => {
    if (!hasAdminAccess) return;
    setEditMode(true);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('edit', '1');
      url.searchParams.set('key', ADMIN_KEY);
      window.history.replaceState({}, '', url.toString());
    }
  }, [hasAdminAccess]);

  const exitEditMode = useCallback((save: boolean, newOrder?: string[]) => {
    if (save && newOrder) {
      setOrder(newOrder);
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder)); } catch { /* ignore */ }
    }
    setEditMode(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('edit');
      url.searchParams.delete('key');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const resetOrder = useCallback(() => {
    setOrder(defaultOrder);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const moveItem = useCallback((list: string[], from: number, to: number) => {
    const next = list.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }, []);

  return { order, editMode, hydrated, hasAdminAccess, sortWorks, enterEditMode, exitEditMode, resetOrder, moveItem, hasCustomOrder: order.length > 0 };
}
