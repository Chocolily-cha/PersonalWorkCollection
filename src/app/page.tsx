'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryNav from '@/components/CategoryNav';
import WorkList from '@/components/WorkList';
import WorkDetail from '@/components/WorkDetail';
import { Work, Category, CATEGORY_ORDER } from '@/data/types';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWorkOrder } from '@/hooks/useWorkOrder';

const PER_ROUND = 4;

function interleaveByCategory(works: Work[]): Work[] {
  const byCat = new Map<Category, Work[]>();
  works.forEach((w) => {
    const list = byCat.get(w.category) || [];
    list.push(w);
    byCat.set(w.category, list);
  });
  const orderedCats = CATEGORY_ORDER.filter((c) => byCat.has(c));
  const result: Work[] = [];
  let round = 0;
  while (true) {
    let added = 0;
    for (const cat of orderedCats) {
      const arr = byCat.get(cat)!;
      const slice = arr.slice(round * PER_ROUND, (round + 1) * PER_ROUND);
      if (slice.length) {
        result.push(...slice);
        added += slice.length;
      }
    }
    if (!added) break;
    round++;
  }
  return result;
}

export default function Home() {
  const { works, counts, loading, error } = usePortfolio();
  const [activeCat, setActiveCat] = useState<Category | 'all'>('all');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [detailEditMode, setDetailEditMode] = useState(false);

  const { order, editMode, hydrated, sortWorks, exitEditMode, resetOrder, hasCustomOrder } = useWorkOrder(works);

  const filteredWorks = useMemo(() => {
    const sorted = hasCustomOrder ? sortWorks(works) : works;
    return activeCat === 'all' ? interleaveByCategory(sorted) : sorted.filter((w) => w.category === activeCat);
  }, [works, sortWorks, hasCustomOrder, activeCat]);

  const handleCatChange = (cat: Category | 'all') => {
    setActiveCat(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWorkClick = (work: Work) => {
    if (editMode && !detailEditMode) return;
    setSelectedWork(work);
  };

  const handleCloseDetail = () => {
    setSelectedWork(null);
    setDetailEditMode(false);
  };

  const handleBackToOverview = () => setSelectedWork(null);

  const handleSaveOrder = (newCatOrder: string[]) => {
    const otherIds = order.filter((id) => {
      const w = works.find((x) => x.id === id);
      return !w || w.category !== activeCat;
    });
    const firstOldIdx = order.findIndex((id) => {
      const w = works.find((x) => x.id === id);
      return w && w.category === activeCat;
    });
    const merged = firstOldIdx === -1
      ? [...otherIds, ...newCatOrder]
      : [...otherIds.slice(0, firstOldIdx), ...newCatOrder, ...otherIds.slice(firstOldIdx)];
    exitEditMode(true, merged);
  };

  const editModeWorks = useMemo(() => {
    if (!editMode) return filteredWorks;
    const sorted = hydrated ? sortWorks(works) : works;
    return sorted.filter((w) => w.category === activeCat);
  }, [editMode, filteredWorks, sortWorks, works, hydrated, activeCat]);

  const editModeOrderIds = useMemo(() => {
    if (!editMode || !order.length) return [];
    return order.filter((id) => {
      const w = works.find((x) => x.id === id);
      return w && w.category === activeCat;
    });
  }, [editMode, order, works, activeCat]);

  return (
    <div className="min-h-screen">
      <CategoryNav activeCategory={activeCat} onCategoryChange={handleCatChange} counts={counts} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-end justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="cyber-gradient-text">
                {activeCat === 'all' ? '全部作品' : activeCat}
              </span>
            </h1>
            <p className="text-gray-400">
              {loading ? '加载中…' : error ? `加载失败：${error}` : `共 ${filteredWorks.length} 件作品`}
            </p>
          </div>
          {hydrated && detailEditMode && !editMode && (
            <button
              onClick={() => setDetailEditMode(false)}
              className="text-xs px-3 py-1.5 rounded-lg bg-cyber-purple/20 hover:bg-cyber-purple/30 text-cyber-purple border border-cyber-purple/50 transition-colors"
            >
              🖼 详情页编辑中（点击退出）
            </button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WorkList
              works={editMode ? editModeWorks : filteredWorks}
              onWorkClick={handleWorkClick}
              loading={loading}
              editMode={editMode}
              orderIds={editMode ? editModeOrderIds : order}
              onSave={handleSaveOrder}
              onCancel={() => exitEditMode(false)}
              onReset={() => { resetOrder(); exitEditMode(false); }}
              detailEditMode={detailEditMode}
              onEnterDetailEdit={() => { if (editMode) exitEditMode(false); setDetailEditMode(true); }}
              onExitDetailEdit={() => setDetailEditMode(false)}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedWork && (
          <WorkDetail
            work={selectedWork}
            onClose={handleCloseDetail}
            editMode={detailEditMode}
            onBackToOverview={handleBackToOverview}
          />
        )}
      </AnimatePresence>

      <footer className="border-t border-white/10 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 巧克力作品集</p>
        </div>
      </footer>
    </div>
  );
}