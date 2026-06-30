'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Work } from '@/data/types';
import WorkCard from './WorkCard';

interface WorkListProps {
  works: Work[];
  onWorkClick: (work: Work) => void;
  loading?: boolean;
  editMode?: boolean;
  orderIds?: string[];
  onReorder?: (newOrder: string[]) => void;
  onSave?: (newOrder: string[]) => void;
  onCancel?: () => void;
  onReset?: () => void;
  detailEditMode?: boolean;
  onEnterDetailEdit?: () => void;
  onExitDetailEdit?: () => void;
  onDownloadConfig?: () => void;
}

export default function WorkList({
  works,
  onWorkClick,
  loading,
  editMode = false,
  orderIds = [],
  onReorder,
  onSave,
  onCancel,
  onReset,
  detailEditMode = false,
  onEnterDetailEdit,
  onExitDetailEdit,
  onDownloadConfig,
}: WorkListProps) {
  const [pendingOrder, setPendingOrder] = useState<string[]>(orderIds);
  const [dragState, setDragState] = useState<{ from: number; over: number | null } | null>(null);
  const dragImageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editMode) {
      setPendingOrder(orderIds.length ? orderIds : works.map((w) => w.id));
    }
  }, [orderIds, works, editMode]);

  useEffect(() => {
    if (editMode) {
      setPendingOrder(orderIds.length ? orderIds : works.map((w) => w.id));
    }
  }, [editMode, orderIds, works]);

  const orderedWorks = editMode
    ? (() => {
        const map = new Map(works.map((w) => [w.id, w]));
        return pendingOrder.map((id) => map.get(id)).filter((w): w is Work => Boolean(w));
      })()
    : works;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!editMode) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    if (dragImageRef.current) {
      e.dataTransfer.setDragImage(dragImageRef.current, 50, 50);
    }
    setDragState({ from: index, over: index });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!editMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState((s) => (s ? { ...s, over: index } : { from: index, over: index }));
  };

  const handleDragEnd = () => {
    if (!editMode) return;
    setDragState(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    if (!editMode) return;
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(from) || from === dropIndex) {
      setDragState(null);
      return;
    }
    setPendingOrder((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(dropIndex, 0, moved);
      onReorder?.(next);
      return next;
    });
    setDragState(null);
  };

  const handleSave = () => onSave?.(pendingOrder);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl overflow-hidden h-full flex flex-col animate-pulse">
            <div className="aspect-[4/3] bg-white/5" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-full" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
        <p className="text-gray-400 text-lg">暂无该分类的作品</p>
      </motion.div>
    );
  }

  return (
    <>
      {editMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 glass-card rounded-xl border-2 border-cyber-cyan/50 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="text-sm text-gray-200">
            <span className="text-cyber-cyan font-semibold">编辑模式</span>
            <span className="ml-2 text-gray-400">拖拽卡片调整顺序，点击「保存」生效</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onEnterDetailEdit}
              className="px-3 py-1.5 text-sm rounded-lg bg-cyber-purple/20 hover:bg-cyber-purple/30 text-cyber-purple border border-cyber-purple/50 transition-colors"
              title="进入后可点击作品卡片打开详情页，拖拽调整其内图片顺序"
            >
              🖼 调整详情页顺序
            </button>
            <button
              onClick={onDownloadConfig}
              className="px-3 py-1.5 text-sm rounded-lg bg-cyber-green/20 hover:bg-cyber-green/30 text-green-400 border border-green-400/50 transition-colors"
              title="下载排序配置文件，提交到仓库后可在代码更新后保持排序"
            >
              ⬇ 下载配置
            </button>
            <button onClick={onReset} className="px-3 py-1.5 text-sm rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors">
              重置默认
            </button>
            <button onClick={onCancel} className="px-3 py-1.5 text-sm rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors">
              取消
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 text-sm rounded-lg bg-cyber-cyan/20 hover:bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/50 transition-colors font-semibold">
              保存顺序
            </button>
          </div>
        </motion.div>
      )}

      {detailEditMode && !editMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 glass-card rounded-xl border-2 border-cyber-purple/50 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="text-sm text-gray-200">
            <span className="text-cyber-purple font-semibold">详情页编辑模式</span>
            <span className="ml-2 text-gray-400">点击任意作品卡片 → 调整其内图片顺序</span>
          </div>
          <button onClick={onExitDetailEdit} className="px-3 py-1.5 text-sm rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors">
            退出详情页编辑
          </button>
        </motion.div>
      )}

      <div ref={dragImageRef} aria-hidden className="fixed top-0 left-0 pointer-events-none opacity-70 -z-10" style={{ width: 240 }}>
        <div className="glass-card rounded-xl overflow-hidden border-2 border-cyber-cyan">
          <div className="aspect-[4/3] bg-white/10" />
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orderedWorks.map((work, index) => {
          const isDragging = editMode && dragState?.from === index;
          const isDropTarget = editMode && dragState?.over === index && dragState.from !== index;
          return (
            <div
              key={work.id}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative transition-all duration-200 ${editMode ? 'cursor-move' : ''} ${isDragging ? 'opacity-40 scale-95' : ''} ${isDropTarget ? 'ring-2 ring-cyber-cyan ring-offset-2 ring-offset-cyber-darker scale-105' : ''}`}
            >
              <WorkCard
                work={work}
                onClick={() => { if (editMode && !detailEditMode) return; onWorkClick(work); }}
                index={index}
                editMode={editMode}
              />
              {editMode && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-cyber-cyan/80 text-cyber-darker text-xs font-bold shadow-lg pointer-events-none">
                  #{index + 1}
                </div>
              )}
              {detailEditMode && !editMode && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-cyber-purple/80 text-white text-xs font-bold shadow-lg pointer-events-none">
                  可点击
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
    </>
  );
}
