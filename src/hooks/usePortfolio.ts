'use client';

import { useState, useEffect } from 'react';
import type { Work, Category } from '@/data/types';
import { works } from '@/data/works';

export function usePortfolio() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  const counts = works.reduce((acc, work) => {
    acc[work.category] = (acc[work.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filterByCategory = (cat: Category | 'all') => cat === 'all' ? works : works.filter((w) => w.category === cat);

  return { works, counts, loading, error, filterByCategory };
}