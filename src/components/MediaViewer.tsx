'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MediaFile } from '@/data/types';
import { getMediaUrl } from '@/config/paths';

interface MediaViewerProps {
  media: MediaFile;
  autoPlay?: boolean;
}

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MediaViewer({ media, autoPlay = true }: MediaViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverFraction, setHoverFraction] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(true);

  const isVideo = media.isVideo && media.extension !== 'gif';

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;
    if (autoPlay) v.play().catch(() => {});
    return () => v?.pause();
  }, [autoPlay, isVideo]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTimeUpdate = () => { if (!isScrubbing) setCurrentTime(v.currentTime); };
    const onLoaded = () => { setDuration(v.duration || 0); setIsLoading(false); };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('durationchange', onLoaded);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('durationchange', onLoaded);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, [isScrubbing]);

  useEffect(() => { if (videoRef.current) videoRef.current.volume = volume; }, [volume]);
  useEffect(() => { if (videoRef.current) videoRef.current.muted = muted; }, [muted]);

  const fractionFromEvent = useCallback((clientX: number): number => {
    const el = progressRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    return rect.width === 0 ? 0 : x / rect.width;
  }, []);

  const handleScrubDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isVideo || duration <= 0) return;
    e.preventDefault();
    setIsScrubbing(true);
    const fraction = fractionFromEvent(e.clientX);
    const time = fraction * duration;
    setCurrentTime(time);
    if (videoRef.current) videoRef.current.currentTime = time;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleScrubMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isVideo) return;
    const f = fractionFromEvent(e.clientX);
    setHoverFraction(f);
    if (isScrubbing && duration > 0) {
      const time = f * duration;
      setCurrentTime(time);
      if (videoRef.current) videoRef.current.currentTime = time;
    }
  };

  const handleScrubUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isVideo) return;
    setIsScrubbing(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const handleVideoClick = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const seekTo = (sec: number) => {
    const v = videoRef.current;
    if (!v || duration <= 0) return;
    const t = Math.max(0, Math.min(duration, sec));
    v.currentTime = t;
    setCurrentTime(t);
  };

  useEffect(() => {
    if (!isVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); handleVideoClick(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); seekTo(currentTime - 5); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); seekTo(currentTime + 5); }
      else if (e.key === 'm') { e.preventDefault(); setMuted(m => !m); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVideo, currentTime]);

  if (isVideo) {
    const progressFraction = duration > 0 ? currentTime / duration : 0;
    return (
      <div
        ref={containerRef}
        className="relative w-full h-full bg-black rounded-lg overflow-hidden select-none"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        tabIndex={0}
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          muted={muted}
          loop
          playsInline
          controls={false}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          preload="metadata"
          onClick={handleVideoClick}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          <source src={getMediaUrl(media.filePath)} type={`video/${media.extension}`} />
        </video>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-sm text-white/80">视频加载中…</span>
            </div>
          </div>
        )}

        {!isPlaying && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={handleVideoClick}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </motion.div>
        )}

        <div aria-hidden className="absolute inset-0 pointer-events-none flex items-end justify-end p-3" style={{ mixBlendMode: 'overlay', opacity: 0.18 }}>
          <span className="text-[10px] text-white/50 font-light tracking-widest">© 巧克力作品集</span>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-12 bg-gradient-to-t from-black/85 to-transparent"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => { if (!isScrubbing) { setShowControls(false); setHoverFraction(null); } }}
        >
          <div
            ref={progressRef}
            className="relative w-full h-6 flex items-center cursor-pointer group"
            onPointerDown={handleScrubDown}
            onPointerMove={handleScrubMove}
            onPointerUp={handleScrubUp}
            onPointerCancel={handleScrubUp}
            onPointerLeave={() => setHoverFraction(null)}
            role="slider"
            aria-label="视频进度"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
          >
            <div className="absolute left-0 right-0 h-1.5 bg-white/20 rounded-full group-hover:h-2 transition-all" />
            <div className="absolute left-0 h-1.5 bg-white/30 rounded-full group-hover:h-2 transition-all" style={{ width: `${Math.min(100, progressFraction * 100)}%` }} />
            <div className="absolute left-0 h-1.5 bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full group-hover:h-2 transition-all" style={{ width: `${progressFraction * 100}%` }} />
            {showControls && hoverFraction !== null && duration > 0 && (
              <div className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 text-xs text-white pointer-events-none whitespace-nowrap" style={{ left: `${hoverFraction * 100}%` }}>
                {fmt(hoverFraction * duration)}
              </div>
            )}
            <div className={`absolute w-3.5 h-3.5 rounded-full bg-white shadow-lg shadow-cyber-cyan/40 pointer-events-none transition-transform ${isScrubbing || showControls ? 'scale-100' : 'scale-0'}`} style={{ left: `calc(${progressFraction * 100}% - 7px)` }} />
          </div>

          <div className="flex items-center gap-3 mt-1">
            <button onClick={handleVideoClick} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center transition-colors" aria-label={isPlaying ? '暂停' : '播放'}>
              {isPlaying ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <span className="text-xs text-white/80 tabular-nums">{fmt(currentTime)} / {fmt(duration)}</span>

            <div className="flex-1" />

            <button onClick={() => setMuted(m => !m)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors" aria-label={muted ? '取消静音' : '静音'}>
              {muted ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); if (v > 0) setMuted(false); }}
              className="w-20 accent-cyber-cyan"
              aria-label="音量"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center select-none" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      <img
        src={getMediaUrl(media.filePath)}
        alt={media.filename}
        className={`max-w-full max-h-full object-contain ${media.extension !== 'gif' ? 'loading="lazy"' : ''}`}
        loading={media.extension !== 'gif' ? 'lazy' : undefined}
        draggable={false}
      />
      <div aria-hidden className="absolute inset-0 pointer-events-none flex items-end justify-end p-3" style={{ mixBlendMode: 'overlay', opacity: 0.18 }}>
        <span className="text-[10px] text-white/50 font-light tracking-widest">© 巧克力作品集</span>
      </div>
    </div>
  );
}
