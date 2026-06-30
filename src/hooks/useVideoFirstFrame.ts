'use client';

import { useEffect, useState, useRef } from 'react';

const thumbCache = new Map<string, string>();
const blankCache = new Set<string>();
const pendingPromises = new Map<string, Promise<string>>();
const SAMPLE_TIMES = [0, 0.1, 0.2, 0.3, 0.5, 1, 2, 3, 5];
const TIMEOUT_MS = 15000;

const PERF_METRICS = {
  totalAttempts: 0,
  successes: 0,
  failures: 0,
  timeouts: 0,
  avgDuration: 0,
};

function logPerformance(event: string, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[VideoFirstFrame] ${event}`, details);
  }
  if (typeof window !== 'undefined' && (window as unknown as { _perfLog?: Function })._perfLog) {
    (window as unknown as { _perfLog: Function })._perfLog('video-first-frame', event, details);
  }
}

function isBlankImage(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return true;
  const w = canvas.width, h = canvas.height;
  const sampleSize = Math.min(50, w, h);
  if (sampleSize < 10) return false;
  const sx = Math.max(0, Math.floor(w / 2 - sampleSize / 2));
  const sy = Math.max(0, Math.floor(h / 2 - sampleSize / 2));
  try {
    const data = ctx.getImageData(sx, sy, sampleSize, sampleSize).data;
    let totalLuma = 0, minLuma = 255, maxLuma = 0;
    const step = Math.max(1, Math.floor(data.length / 4 / 100));
    for (let i = 0; i < data.length; i += 4 * step) {
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalLuma += luma;
      if (luma < minLuma) minLuma = luma;
      if (luma > maxLuma) maxLuma = luma;
    }
    const avgLuma = totalLuma / (data.length / 4 / step);
    if (avgLuma < 8 || avgLuma > 248 || maxLuma - minLuma < 12) return true;
    return false;
  } catch {
    return false;
  }
}



async function extractFirstFrame(videoUrl: string): Promise<string> {
  if (blankCache.has(videoUrl)) {
    logPerformance('blank-cache-hit', { url: videoUrl });
    throw new Error('Blank thumbnail cached');
  }
  if (thumbCache.has(videoUrl)) {
    logPerformance('cache-hit', { url: videoUrl });
    return thumbCache.get(videoUrl)!;
  }
  if (pendingPromises.has(videoUrl)) {
    logPerformance('pending-reuse', { url: videoUrl });
    return pendingPromises.get(videoUrl)!;
  }

  PERF_METRICS.totalAttempts++;
  const startTime = performance.now();

  const promise = new Promise<string>((resolve, reject) => {
    if (typeof document === 'undefined') {
      const error = new Error('SSR');
      logPerformance('error', { url: videoUrl, error: error.message, phase: 'ssr' });
      PERF_METRICS.failures++;
      reject(error);
      return;
    }
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.style.display = 'none';

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let sampleIndex = 0;
    let aborted = false;
    let hasMetadata = false;

    const cleanup = () => {
      try { video.removeAttribute('src'); video.load(); } catch {}
      if (video.parentNode) video.parentNode.removeChild(video);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const fail = (reason?: string) => {
      if (aborted) return;
      aborted = true;
      cleanup();
      pendingPromises.delete(videoUrl);
      const duration = performance.now() - startTime;
      const errorReason = reason || 'unknown';
      logPerformance('fail', { url: videoUrl, reason: errorReason, duration });
      PERF_METRICS.failures++;
      if (errorReason === 'timeout') PERF_METRICS.timeouts++;
      reject(new Error(`Failed to extract first frame: ${errorReason}`));
    };

    const success = (dataUrl: string) => {
      const duration = performance.now() - startTime;
      PERF_METRICS.successes++;
      PERF_METRICS.avgDuration = (PERF_METRICS.avgDuration * (PERF_METRICS.successes - 1) + duration) / PERF_METRICS.successes;
      logPerformance('success', { url: videoUrl, duration, sampleIndex });
      resolve(dataUrl);
    };

    const capture = () => {
      try {
        if (!video.videoWidth || !video.videoHeight) {
          sampleIndex++;
          logPerformance('retry', { url: videoUrl, reason: 'no-dimensions', sampleIndex });
          if (sampleIndex >= SAMPLE_TIMES.length) {
            fail('no-dimensions-after-retries');
            return;
          }
          trySeek();
          return;
        }
        const canvas = document.createElement('canvas');
        const MAX = 600;
        const ratio = Math.min(MAX / video.videoWidth, MAX / video.videoHeight, 1);
        canvas.width = Math.max(1, Math.round(video.videoWidth * ratio));
        canvas.height = Math.max(1, Math.round(video.videoHeight * ratio));
        const ctx = canvas.getContext('2d');
        if (!ctx) { fail('no-canvas-context'); return; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (!isBlankImage(canvas)) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          thumbCache.set(videoUrl, dataUrl);
          pendingPromises.delete(videoUrl);
          cleanup();
          success(dataUrl);
          return;
        }
        sampleIndex++;
        logPerformance('retry', { url: videoUrl, reason: 'blank-image', sampleIndex });
        if (sampleIndex >= SAMPLE_TIMES.length) {
        blankCache.add(videoUrl);
        pendingPromises.delete(videoUrl);
        cleanup();
        fail('all-samples-blank');
        return;
      }
      trySeek();
      } catch (e) {
        fail('capture-exception');
        logPerformance('error', { url: videoUrl, error: (e as Error).message });
      }
    };

    const trySeek = () => {
      if (aborted) return;
      if (!hasMetadata) {
        return;
      }
      const t = SAMPLE_TIMES[sampleIndex];
      const dur = isFinite(video.duration) ? video.duration : 0;
      if (dur > 0 && t >= dur) {
        try { video.currentTime = Math.max(0, dur - 0.1); } catch { capture(); }
        return;
      }
      try { video.currentTime = t; } catch { capture(); }
    };

    video.addEventListener('loadedmetadata', () => {
      hasMetadata = true;
      const dur = isFinite(video.duration) ? video.duration : 0;
      if (dur > 0 && dur < 1) {
        try { video.currentTime = 0; } catch {}
      } else {
        trySeek();
      }
    });

    video.addEventListener('loadeddata', () => {
      if (!aborted && hasMetadata) {
        capture();
      }
    });

    video.addEventListener('seeked', () => { if (!aborted) capture(); });
    video.addEventListener('error', () => {
      const errorCode = video.error?.code || 'unknown';
      const errorMsg = video.error?.message || 'video-error';
      logPerformance('video-error', { url: videoUrl, code: errorCode, message: errorMsg });
      fail(`video-error-${errorCode}`);
    });
    timeoutId = setTimeout(() => fail('timeout'), TIMEOUT_MS);

    document.body.appendChild(video);
    video.src = videoUrl;
    video.load();
  });

  pendingPromises.set(videoUrl, promise);
  return promise;
}

interface FirstFrameState {
  thumb: string | null;
  loading: boolean;
  error: boolean;
}

export function useVideoFirstFrame(videoUrl: string | undefined, fallbackUrl?: string): FirstFrameState {
  const initial: FirstFrameState = !videoUrl
    ? { thumb: fallbackUrl || null, loading: false, error: false }
    : { thumb: fallbackUrl || null, loading: false, error: false };
  const [state, setState] = useState<FirstFrameState>(initial);
  const prevUrlRef = useRef<string | undefined>(videoUrl);

  useEffect(() => {
    if (!videoUrl) { setState({ thumb: fallbackUrl || null, loading: false, error: false }); return; }
    if (videoUrl === prevUrlRef.current) { return; }
    prevUrlRef.current = videoUrl;
    if (fallbackUrl) {
      setState({ thumb: fallbackUrl, loading: false, error: false });
      return;
    }
    setState({ thumb: fallbackUrl || null, loading: true, error: false });
    let cancelled = false;
    extractFirstFrame(videoUrl)
      .then((dataUrl) => { if (!cancelled) setState({ thumb: dataUrl, loading: false, error: false }); })
      .catch(() => { if (!cancelled) setState({ thumb: fallbackUrl || null, loading: false, error: true }); });
    return () => { cancelled = true; };
  }, [videoUrl, fallbackUrl]);

  return state;
}

export function prefetchFirstFrame(videoUrl: string): Promise<string> {
  return extractFirstFrame(videoUrl);
}
