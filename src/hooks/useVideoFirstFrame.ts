'use client';

import { useEffect, useState } from 'react';

const thumbCache = new Map<string, string>();
const pendingPromises = new Map<string, Promise<string>>();
const SAMPLE_TIMES = [0, 0.5, 1, 2, 3, 5, 8, 12];

function isBlankImage(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return true;
  const w = canvas.width, h = canvas.height;
  const sampleSize = 100;
  const sx = Math.max(0, Math.floor(w / 2 - sampleSize / 2));
  const sy = Math.max(0, Math.floor(h / 2 - sampleSize / 2));
  const sw = Math.min(sampleSize, w - sx);
  const sh = Math.min(sampleSize, h - sy);
  try {
    const data = ctx.getImageData(sx, sy, sw, sh).data;
    let totalLuma = 0, minLuma = 255, maxLuma = 0;
    const pixelCount = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalLuma += luma;
      if (luma < minLuma) minLuma = luma;
      if (luma > maxLuma) maxLuma = luma;
    }
    const avgLuma = totalLuma / pixelCount;
    if (avgLuma < 8 || avgLuma > 248 || maxLuma - minLuma < 12) return true;
    return false;
  } catch {
    return false;
  }
}

function extractFirstFrame(videoUrl: string): Promise<string> {
  if (thumbCache.has(videoUrl)) return Promise.resolve(thumbCache.get(videoUrl)!);
  if (pendingPromises.has(videoUrl)) return pendingPromises.get(videoUrl)!;

  const promise = new Promise<string>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('SSR'));
      return;
    }
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.style.display = 'none';

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let sampleIndex = 0;
    let aborted = false;

    const cleanup = () => {
      try { video.removeAttribute('src'); video.load(); } catch {}
      if (video.parentNode) video.parentNode.removeChild(video);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const fail = () => {
      if (aborted) return;
      aborted = true;
      cleanup();
      pendingPromises.delete(videoUrl);
      reject(new Error('Failed to extract first frame'));
    };

    const capture = () => {
      try {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        const ratio = Math.min(MAX / video.videoWidth, MAX / video.videoHeight, 1);
        canvas.width = Math.max(1, Math.round(video.videoWidth * ratio));
        canvas.height = Math.max(1, Math.round(video.videoHeight * ratio));
        const ctx = canvas.getContext('2d');
        if (!ctx) { fail(); return; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (!isBlankImage(canvas)) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          thumbCache.set(videoUrl, dataUrl);
          pendingPromises.delete(videoUrl);
          cleanup();
          resolve(dataUrl);
          return;
        }
        sampleIndex++;
        if (sampleIndex >= SAMPLE_TIMES.length) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          thumbCache.set(videoUrl, dataUrl);
          pendingPromises.delete(videoUrl);
          cleanup();
          resolve(dataUrl);
          return;
        }
        trySeek();
      } catch { fail(); }
    };

    const trySeek = () => {
      if (aborted) return;
      const t = SAMPLE_TIMES[sampleIndex];
      const dur = isFinite(video.duration) ? video.duration : 0;
      if (dur > 0 && t >= dur) {
        try { video.currentTime = Math.max(0, dur - 0.1); } catch { capture(); }
        return;
      }
      try { video.currentTime = t; } catch { capture(); }
    };

    video.addEventListener('loadedmetadata', () => {
      const dur = isFinite(video.duration) ? video.duration : 0;
      if (dur > 0 && dur < 1) { try { video.currentTime = 0; } catch {} }
      else { trySeek(); }
    });

    video.addEventListener('seeked', () => { if (!aborted) capture(); });
    video.addEventListener('error', fail);
    timeoutId = setTimeout(fail, 12000);

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
    ? { thumb: null, loading: false, error: false }
    : thumbCache.has(videoUrl)
      ? { thumb: thumbCache.get(videoUrl) || null, loading: false, error: false }
      : { thumb: null, loading: true, error: false };
  const [state, setState] = useState<FirstFrameState>(initial);

  useEffect(() => {
    if (!videoUrl) { setState({ thumb: null, loading: false, error: false }); return; }
    const cached = thumbCache.get(videoUrl);
    if (cached) { setState({ thumb: cached, loading: false, error: false }); return; }
    setState({ thumb: null, loading: true, error: false });
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
