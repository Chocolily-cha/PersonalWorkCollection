import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, Category } from '@/data/types';

interface CategoryNavProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  counts?: Record<string, number>;
}

export default function CategoryNav({ activeCategory, onCategoryChange, counts }: CategoryNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getButtonClass = (cat: string) => `px-4 py-2 rounded-lg transition-all duration-300 ${
    activeCategory === cat
      ? 'bg-gradient-to-r from-cyber-purple to-cyber-blue text-white shadow-lg shadow-cyber-purple/30'
      : 'text-gray-400 hover:text-white hover:bg-white/10'
  }`;

  const getBadgeClass = (cat: string) => `${activeCategory === cat ? 'bg-white/20' : 'bg-white/5 text-gray-500'}`;

  return (
    <nav className="w-full sticky top-0 z-50 bg-cyber-dark/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎨</span>
            <span className="text-xl font-bold cyber-gradient-text">巧克力作品集</span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <button onClick={() => onCategoryChange('all')} className={getButtonClass('all')}>全部</button>
            {CATEGORIES.map((category) => (
              <motion.button
                key={category.name}
                onClick={() => onCategoryChange(category.name)}
                className={`${getButtonClass(category.name)} flex items-center space-x-2`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                {counts && counts[category.name] !== undefined && (
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${getBadgeClass(category.name)}`}>
                    {counts[category.name]}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-white/10"
            >
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => { onCategoryChange('all'); setMobileMenuOpen(false); }}
                  className={`px-4 py-3 rounded-lg text-left transition-all ${activeCategory === 'all' ? 'bg-gradient-to-r from-cyber-purple to-cyber-blue text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                  全部
                </button>
                {CATEGORIES.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => { onCategoryChange(category.name); setMobileMenuOpen(false); }}
                    className={`px-4 py-3 rounded-lg text-left transition-all flex items-center space-x-2 ${
                      activeCategory === category.name ? 'bg-gradient-to-r from-cyber-purple to-cyber-blue text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                    {counts && counts[category.name] !== undefined && (
                      <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${getBadgeClass(category.name)}`}>
                        {counts[category.name]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
