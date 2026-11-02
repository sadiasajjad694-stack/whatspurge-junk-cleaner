/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  HardDrive,
  Copy,
  Film,
  Sliders,
  CheckCircle2,
  Trash2,
  Download,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  History,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { WhatsAppMediaItem, StorageStats, CleaningRule, MediaCategory, CleaningLog } from './types/cleaner';
import { INITIAL_WHATSAPP_ITEMS, INITIAL_CLEANING_RULES } from './data/mockWhatsappData';
import { formatBytes, formatDate } from './utils/formatters';

// Components
import { Navbar } from './components/Navbar';
import { StorageGauge } from './components/StorageGauge';
import { MediaGrid } from './components/MediaGrid';
import { DuplicateManager } from './components/DuplicateManager';
import { LargeFilesHunter } from './components/LargeFilesHunter';
import { AutoCleanRules } from './components/AutoCleanRules';
import { ScannerModal } from './components/ScannerModal';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { RecycleBinModal } from './components/RecycleBinModal';
import { WhatsappGuideModal } from './components/WhatsappGuideModal';
import { UploadFolderModal } from './components/UploadFolderModal';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = () => {
    setIsDark((prev) => !prev);
  };

  // Main navigation tab
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'explorer' | 'duplicates' | 'large' | 'rules'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');

  // Media data & Trash
  const [items, setItems] = useState<WhatsAppMediaItem[]>(INITIAL_WHATSAPP_ITEMS);
  const [trashItems, setTrashItems] = useState<WhatsAppMediaItem[]>([]);
  const [cleaningRules, setCleaningRules] = useState<CleaningRule[]>(INITIAL_CLEANING_RULES);
  const [cleaningLogs, setCleaningLogs] = useState<CleaningLog[]>([
    {
      id: 'log-initial',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      filesDeletedCount: 42,
      bytesReclaimed: 1240000000,
      categoriesPurged: ['statuses', 'cache'],
    },
  ]);
  const [isRealDataActive, setIsRealDataActive] = useState(false);

  // Modals
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isWhatsappGuideOpen, setIsWhatsappGuideOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<WhatsAppMediaItem | null>(null);

  // Feedback states
  const [isCleaningJunk, setIsCleaningJunk] = useState(false);
  const [celebrationNotice, setCelebrationNotice] = useState<string | null>(null);

  // Compute live storage stats
  const stats: StorageStats = useMemo(() => {
    const totalDeviceBytes = 128 * 1024 * 1024 * 1024; // 128 GB
    const whatsAppTotalBytes = items.reduce((acc, item) => acc + item.sizeBytes, 0);
    const junkRecommendedBytes = items
      .filter((i) => i.isJunkRecommended)
      .reduce((acc, item) => acc + item.sizeBytes, 0);

    const categories: MediaCategory[] = [
      'images',
      'videos',
      'voice_notes',
      'documents',
      'statuses',
      'stickers',
      'backups',
      'cache',
    ];

    const categoryBreakdown: Record<MediaCategory, { bytes: number; count: number }> = {} as any;
    categories.forEach((cat) => {
      const catItems = items.filter((i) => i.category === cat);
      categoryBreakdown[cat] = {
        bytes: catItems.reduce((acc, i) => acc + i.sizeBytes, 0),
        count: catItems.length,
      };
    });

    const otherAppsBytes = 56 * 1024 * 1024 * 1024; // ~56 GB OS & other apps
    const usedDeviceBytes = otherAppsBytes + whatsAppTotalBytes;

    return {
      totalDeviceBytes,
      usedDeviceBytes,
      whatsAppTotalBytes,
      junkRecommendedBytes,
      categoryBreakdown,
    };
  }, [items]);

  // Delete items (moves to trash)
  const handleDeleteItems = (ids: string[]) => {
    const idsSet = new Set(ids);
    const toDelete = items.filter((item) => idsSet.has(item.id));
    const remaining = items.filter((item) => !idsSet.has(item.id));

    setTrashItems((prev) => [...toDelete, ...prev]);
    setItems(remaining);

    const bytesReclaimed = toDelete.reduce((acc, i) => acc + i.sizeBytes, 0);
    setCleaningLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        filesDeletedCount: toDelete.length,
        bytesReclaimed,
        categoriesPurged: Array.from(new Set(toDelete.map((i) => i.category))),
      },
      ...prev,
    ]);

    setCelebrationNotice(`Purged ${toDelete.length} files (${formatBytes(bytesReclaimed)} freed)`);
    setTimeout(() => setCelebrationNotice(null), 3500);
  };

  // One-tap clean recommended junk
  const handleCleanRecommendedJunk = () => {
    const junkItems = items.filter((i) => i.isJunkRecommended);
    if (junkItems.length === 0) return;

    setIsCleaningJunk(true);
    setTimeout(() => {
      handleDeleteItems(junkItems.map((i) => i.id));
      setIsCleaningJunk(false);
    }, 700);
  };

  // Restore from trash
  const handleRestoreItem = (id: string) => {
    const itemToRestore = trashItems.find((i) => i.id === id);
    if (!itemToRestore) return;
    setTrashItems((prev) => prev.filter((i) => i.id !== id));
    setItems((prev) => [itemToRestore, ...prev]);
  };

  const handleRestoreAll = () => {
    setItems((prev) => [...trashItems, ...prev]);
    setTrashItems([]);
  };

  const handleEmptyTrash = () => {
    setTrashItems([]);
  };

  // Toggle rules
  const handleToggleRule = (id: string) => {
    setCleaningRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  // Apply active rules
  const handleApplyRules = () => {
    const enabledCategories = new Set(
      cleaningRules.filter((r) => r.enabled).map((r) => r.category)
    );

    const itemsToPurge = items.filter((item) => {
      if (item.isJunkRecommended) {
        if (enabledCategories.has('all')) return true;
        if (enabledCategories.has(item.category)) return true;
      }
      return false;
    });

    if (itemsToPurge.length > 0) {
      handleDeleteItems(itemsToPurge.map((i) => i.id));
    }
  };

  // Import real files
  const handleImportRealFiles = (newItems: WhatsAppMediaItem[]) => {
    setItems(newItems);
    setIsRealDataActive(true);
    setCurrentTab('explorer');
    setSelectedCategory('all');
  };

  const handleResetDemoData = () => {
    setItems(INITIAL_WHATSAPP_ITEMS);
    setIsRealDataActive(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenScan={() => setIsScanOpen(true)}
        onOpenTrash={() => setIsTrashOpen(true)}
        trashCount={trashItems.length}
        isDark={isDark}
        toggleDark={toggleDark}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Reclaimed toast notice */}
      {celebrationNotice && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 bg-emerald-600 text-white py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-3 animate-scale-up border border-emerald-400/30">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold">{celebrationNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">
        
        {/* Tab 1: Dashboard / Overview */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Storage Gauge Card */}
            <StorageGauge
              stats={stats}
              onCleanJunk={handleCleanRecommendedJunk}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setCurrentTab('explorer');
              }}
              isCleaning={isCleaningJunk}
            />

            {/* Quick Action Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Duplicate Media Shortcut */}
              <div
                onClick={() => setCurrentTab('duplicates')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Copy className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-blue-500 flex items-center gap-1">
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Duplicate Forwards
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Find and purge identical memes and photos forwarded across multiple groups.
                </p>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold tabular-nums">
                  {items.filter((i) => i.isDuplicate).length} duplicate files found
                </div>
              </div>

              {/* Card 2: Large Videos & Media */}
              <div
                onClick={() => setCurrentTab('large')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-red-500/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Film className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <span>Target</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Heavy Files (&gt;20MB)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Target heavy video streams and database snapshots consuming bulk storage.
                </p>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold tabular-nums">
                  {items.filter((i) => i.sizeBytes >= 20971520).length} heavy items
                </div>
              </div>

              {/* Card 3: Storage Tips & WhatsApp Rules */}
              <div
                onClick={() => setIsWhatsappGuideOpen(true)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <span>Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Stop Storage Bleed
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Learn how to turn off WhatsApp media auto-download to save up to 10GB monthly.
                </p>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  3 simple steps
                </div>
              </div>
            </div>

            {/* Recent Cleanups History */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cleaning Activity Log
                  </h4>
                </div>
                <span className="text-xs text-slate-400">
                  Total reclaimed all-time:{' '}
                  <strong className="text-emerald-500 tabular-nums">
                    {formatBytes(cleaningLogs.reduce((acc, l) => acc + l.bytesReclaimed, 0))}
                  </strong>
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {cleaningLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Purged {log.filesDeletedCount} redundant items
                      </span>
                      <span className="text-slate-400 block text-[11px]">
                        {formatDate(log.timestamp)} · Categories: {log.categoriesPurged.join(', ')}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-500 tabular-nums">
                      +{formatBytes(log.bytesReclaimed)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Explorer / Media Folders */}
        {currentTab === 'explorer' && (
          <MediaGrid
            items={items}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onPreviewItem={setPreviewItem}
            onDeleteItems={handleDeleteItems}
          />
        )}

        {/* Tab 3: Duplicates */}
        {currentTab === 'duplicates' && (
          <DuplicateManager
            items={items}
            onDeleteItems={handleDeleteItems}
            onPreviewItem={setPreviewItem}
          />
        )}

        {/* Tab 4: Large Files */}
        {currentTab === 'large' && (
          <LargeFilesHunter
            items={items}
            onDeleteItems={handleDeleteItems}
            onPreviewItem={setPreviewItem}
          />
        )}

        {/* Tab 5: Auto-Rules */}
        {currentTab === 'rules' && (
          <AutoCleanRules
            rules={cleaningRules}
            onToggleRule={handleToggleRule}
            onApplyRules={handleApplyRules}
            onOpenWhatsappGuide={() => setIsWhatsappGuideOpen(true)}
          />
        )}
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar (Pattern 1 from Mobile Touch Apps reference) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center h-16 px-1 shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <HardDrive className="w-5 h-5" />
          <span className="text-[10px] mt-1">Storage</span>
        </button>

        <button
          onClick={() => setCurrentTab('explorer')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'explorer' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-1">Folders</span>
        </button>

        <button
          onClick={() => setCurrentTab('duplicates')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'duplicates' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Copy className="w-5 h-5" />
          <span className="text-[10px] mt-1">Duplicates</span>
        </button>

        <button
          onClick={() => setCurrentTab('large')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'large' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Film className="w-5 h-5" />
          <span className="text-[10px] mt-1">Large</span>
        </button>

        <button
          onClick={() => setCurrentTab('rules')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'rules' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] mt-1">Rules</span>
        </button>
      </nav>

      {/* Modals */}
      <ScannerModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanComplete={() => {
          setSelectedCategory('all');
          setCurrentTab('explorer');
        }}
        currentJunkBytes={stats.junkRecommendedBytes}
      />

      <MediaPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onDelete={(id) => handleDeleteItems([id])}
      />

      <RecycleBinModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        trashItems={trashItems}
        onRestoreItem={handleRestoreItem}
        onRestoreAll={handleRestoreAll}
        onEmptyTrash={handleEmptyTrash}
      />

      <WhatsappGuideModal
        isOpen={isWhatsappGuideOpen}
        onClose={() => setIsWhatsappGuideOpen(false)}
      />

      <UploadFolderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportRealFiles={handleImportRealFiles}
        onResetDemoData={handleResetDemoData}
        isRealDataActive={isRealDataActive}
      />
    </div>
  );
}
