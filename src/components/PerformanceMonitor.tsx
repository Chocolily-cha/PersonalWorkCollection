'use client';

import { useEffect, useRef } from 'react';

interface PerfEntry {
  timestamp: number;
  type: string;
  name: string;
  duration?: number;
  details?: Record<string, unknown>;
}

const perfLog: PerfEntry[] = [];

export function logPerf(type: string, name: string, details?: Record<string, unknown>) {
  perfLog.push({
    timestamp: performance.now(),
    type,
    name,
    details,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[PerfMonitor] ${type}: ${name}`, details);
  }
}

export function logResourceLoad(resource: PerformanceResourceTiming) {
  const duration = resource.responseEnd - resource.requestStart;
  const size = resource.transferSize || resource.encodedBodySize || 0;
  const status = resource.responseStatus;

  if (status >= 400) {
    console.warn(`[ResourceError] ${resource.name} - Status: ${status}, Duration: ${duration.toFixed(2)}ms`);
  }

  logPerf('resource', resource.name, {
    duration: duration.toFixed(2),
    size: formatSize(size),
    status,
    initiator: resource.initiatorType,
  });
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function reportMetrics() {
  if (process.env.NODE_ENV !== 'production') {
    const totalResources = perfLog.filter(p => p.type === 'resource').length;
    const errors = perfLog.filter(p => p.type === 'error').length;
    console.log(`[PerfReport] Resources: ${totalResources}, Errors: ${errors}`);
    
    const slowResources = perfLog
      .filter(p => p.type === 'resource' && typeof p.details?.duration === 'string')
      .sort((a, b) => parseFloat(b.details?.duration as string) - parseFloat(a.details?.duration as string))
      .slice(0, 5);
    
    if (slowResources.length > 0) {
      console.log('[PerfReport] Slowest resources:', slowResources);
    }
  }
}

export default function PerformanceMonitor() {
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            logResourceLoad(entry as PerformanceResourceTiming);
          }
        });
      });

      observerRef.current.observe({ entryTypes: ['resource'] });
    }

    window.addEventListener('load', reportMetrics);
    window.addEventListener('error', (e) => {
      logPerf('error', e.message, {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
      });
    });

    (window as unknown as { _perfLog: Function })._perfLog = logPerf;

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('load', reportMetrics);
    };
  }, []);

  return null;
}