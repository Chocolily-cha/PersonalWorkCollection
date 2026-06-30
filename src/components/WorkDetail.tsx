import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Work, MediaFile } from '@/data/types';
import { useMediaOrder } from '@/hooks/useMediaOrder';
import { getMediaUrl } from '@/config/paths';
import MediaViewer from './MediaViewer';

interface WorkDetailProps {
  work: Work;
  onClose: () => void;
  editMode?: boolean;
  onBackToOverview?: () => void;
}

export default function WorkDetail({ work, onClose, editMode = false, onBackToOverview }: WorkDetailProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [pendingOrder, setPendingOrder] = useState<string[]>(work.mediaFiles.map((m) => m.filename));
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const allFilenames = work.mediaFiles.map((m) => m.filename);
  const { sortMedia, saveOrder, resetOrder, hydrated } = useMediaOrder(work.id, allFilenames);

  useEffect(() => {
    if (editMode && hydrated) {
      setPendingOrder(sortMedia(allFilenames));
    }
  }, [editMode, hydrated, work.id]);

  const orderedMedia: MediaFile[] = editMode
    ? (() => {
        const map = new Map(work.mediaFiles.map((m) => [m.filename, m]));
        return pendingOrder.map((fn) => map.get(fn)).filter((m): m is MediaFile => Boolean(m));
      })()
    : work.mediaFiles;

  const currentMedia = orderedMedia[currentMediaIndex];
  const isVideo = currentMedia?.isVideo && currentMedia.extension !== 'gif';

  useEffect(() => {
    if (!toast) return;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, [toast]);

  const movePending = useCallback((from: number, to: number) => {
    setPendingOrder((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!editMode) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setDragFrom(index);
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!editMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOver !== index) setDragOver(index);
  };
  const handleDragEnd = () => { setDragFrom(null); setDragOver(null); };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!editMode) return;
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(from) && from !== dropIndex) movePending(from, dropIndex);
    setDragFrom(null); setDragOver(null);
  };

  const handleSave = useCallback(() => {
    const ok = saveOrder(pendingOrder);
    setToast({ type: ok ? 'success' : 'error', text: ok ? '✓ 图片顺序已保存' : '✗ 保存失败，请重试' });
  }, [pendingOrder, saveOrder]);

  const handleResetDefault = useCallback(() => {
    resetOrder();
    setPendingOrder(allFilenames);
    setToast({ type: 'success', text: '已重置为默认顺序' });
  }, [allFilenames, resetOrder]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (editMode) return;
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || editMode) return;
    const distance = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(distance) > 50) {
      setCurrentMediaIndex((prev) =>
        distance > 0 ? (prev < orderedMedia.length - 1 ? prev + 1 : prev) : (prev > 0 ? prev - 1 : prev)
      );
    }
    setTouchStart(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8" onClick={(e) => e.stopPropagation()}>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="关闭"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {editMode && (
            <div className="px-4 py-2 bg-cyber-purple/20 border-b border-cyber-purple/40 flex items-center justify-between text-sm">
              <span className="text-cyber-purple font-semibold">详情页编辑模式</span>
              <span className="text-gray-300 text-xs">拖拽或上下移动调整图片顺序</span>
            </div>
          )}

          <div className="relative aspect-video bg-black" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <AnimatePresence mode="wait">
              {currentMedia ? (isVideo ? (
                <motion.div key={currentMediaIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                  <MediaViewer media={currentMedia} />
                </motion.div>
              ) : (
                <motion.img
                  key={currentMediaIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  src={getMediaUrl(currentMedia.filePath)}
                  alt={work.title}
                  className="w-full h-full object-contain"
                />
              )) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <span>无媒体内容</span>
                </div>
              )}
            </AnimatePresence>

            {!editMode && orderedMedia.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : prev)); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex((prev) => (prev < orderedMedia.length - 1 ? prev + 1 : prev)); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {orderedMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {orderedMedia.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); if (!editMode) setCurrentMediaIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentMediaIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {orderedMedia.length > 1 && (
            <div className="p-4 border-t border-white/10">
              <div className="text-xs text-gray-400 mb-2">{editMode ? '↑↓ 拖拽或点击箭头调整顺序' : '缩略图导航'}</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {orderedMedia.map((media, index) => {
                  const isDragging = editMode && dragFrom === index;
                  const isDropTarget = editMode && dragOver === index && dragFrom !== index;
                  return (
                    <div
                      key={media.filename}
                      draggable={editMode}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`relative flex-shrink-0 transition-all ${editMode ? 'cursor-move' : ''} ${isDragging ? 'opacity-40 scale-95' : ''} ${isDropTarget ? 'ring-2 ring-cyber-purple ring-offset-2 ring-offset-cyber-darker scale-105' : ''}`}
                    >
                      <button
                  onClick={() => { if (editMode) return; setCurrentMediaIndex(index); }}
                  className={`block w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentMediaIndex ? 'border-cyber-purple shadow-lg shadow-cyber-purple/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={getMediaUrl(media.filePath)} alt={media.filename} className="w-full h-full object-cover" draggable={false} loading="lazy" />
                </button>
                      {editMode && (
                        <>
                          <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-cyber-purple text-white text-xs font-bold flex items-center justify-center shadow-lg pointer-events-none">
                            {index + 1}
                          </div>
                          <div className="absolute -right-2 top-0 bottom-0 flex flex-col gap-0.5 pointer-events-none">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); movePending(index, index - 1); }}
                              disabled={index === 0}
                              className="w-5 h-5 rounded-t bg-white/80 hover:bg-white text-cyber-darker flex items-center justify-center text-xs leading-none disabled:opacity-30 disabled:cursor-not-allowed pointer-events-auto"
                              aria-label="上移"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); movePending(index, index + 1); }}
                              disabled={index === orderedMedia.length - 1}
                              className="w-5 h-5 rounded-b bg-white/80 hover:bg-white text-cyber-darker flex items-center justify-center text-xs leading-none disabled:opacity-30 disabled:cursor-not-allowed pointer-events-auto"
                              aria-label="下移"
                            >
                              ▼
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-cyber-purple/20 text-cyber-cyan text-sm mb-2 inline-block">{work.category}</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white neon-text">{work.title}</h2>
              </div>
              {work.createdAt && <span className="text-gray-400 text-sm">{work.createdAt}</span>}
            </div>

            <div className="mb-4">
              <h3 className="text-sm text-gray-400 mb-2">使用工具</h3>
              <div className="flex flex-wrap gap-2">
                {work.tools.map((tool) => (
                  <span key={tool} className="px-3 py-1.5 rounded-full bg-white/10 text-white text-sm">{tool}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-2">作品描述</h3>
              <p className="text-gray-300 leading-relaxed">{work.description}</p>
            </div>

            {editMode && (
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-3 items-center justify-between">
                <button onClick={handleResetDefault} className="px-3 py-1.5 text-sm rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors">
                  重置默认
                </button>
                <div className="flex gap-2">
                  {onBackToOverview && (
                    <button onClick={onBackToOverview} className="px-4 py-1.5 text-sm rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition-colors">
                      ← 返回总览
                    </button>
                  )}
                  <button onClick={handleSave} className="px-5 py-1.5 text-sm rounded-lg bg-cyber-purple/30 hover:bg-cyber-purple/50 text-cyber-purple border border-cyber-purple/60 transition-colors font-semibold">
                    保存排序
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 px-5 py-2.5 rounded-xl shadow-2xl text-sm font-medium ${toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
            style={{ zIndex: 100 }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
