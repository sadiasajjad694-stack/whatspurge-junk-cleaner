import React from 'react';
import { Sparkles, Moon, Sun, Trash2, Smartphone } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'explorer' | 'duplicates' | 'large' | 'rules';
  setCurrentTab: (tab: 'dashboard' | 'explorer' | 'duplicates' | 'large' | 'rules') => void;
  onOpenScan: () => void;
  onOpenTrash: () => void;
  trashCount: number;
  isDark: boolean;
  toggleDark: () => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenScan,
  onOpenTrash,
  trashCount,
  isDark,
  toggleDark,
  onOpenUpload,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <img
            src="/assets/aistudio/image_20261102_084642_84ba4b1c.jpg"
            alt="WhatsPurge App Logo"
            className="w-8 h-8 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform shrink-0"
          />
          <span>WhatsPurge</span>
        </button>

        {/* Zone 2: 4-5 nav links, 1-2 word labels, single-line */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentTab('explorer')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'explorer'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Media Folders
          </button>
          <button
            onClick={() => setCurrentTab('duplicates')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'duplicates'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Duplicates
          </button>
          <button
            onClick={() => setCurrentTab('large')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'large'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Large Media
          </button>
          <button
            onClick={() => setCurrentTab('rules')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'rules'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Auto Cleaner
          </button>
        </nav>

        {/* Zone 3: 1 primary action (plus subtle quick utilities) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenUpload}
            title="Inspect device folder / real files"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenTrash}
            title="Recycle bin"
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {trashCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>

          <button
            onClick={toggleDark}
            title="Toggle theme"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenScan}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deep Scan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
