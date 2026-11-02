import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  Download,
  Eye,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  FileText,
  Film,
  Image,
  Mic,
  Database,
  Archive,
  Layers,
} from 'lucide-react';
import { WhatsAppMediaItem, MediaCategory } from '../types/cleaner';
import { formatBytes, formatDate, formatDuration, getCategoryLabel, getCategoryTheme } from '../utils/formatters';

interface MediaGridProps {
  items: WhatsAppMediaItem[];
  selectedCategory: MediaCategory | 'all';
  onSelectCategory: (category: MediaCategory | 'all') => void;
  onPreviewItem: (item: WhatsAppMediaItem) => void;
  onDeleteItems: (ids: string[]) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
  onPreviewItem,
  onDeleteItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'all' | 'sent' | 'received'>('all');
  const [filterJunkOnly, setFilterJunkOnly] = useState(false);
  const [filterDuplicatesOnly, setFilterDuplicatesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'size_desc' | 'size_asc' | 'date_desc' | 'date_asc'>('size_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
        if (filterDirection !== 'all' && item.direction !== filterDirection) return false;
        if (filterJunkOnly && !item.isJunkRecommended) return false;
        if (filterDuplicatesOnly && !item.isDuplicate) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return item.name.toLowerCase().includes(q) || item.chatOrigin.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'size_desc') return b.sizeBytes - a.sizeBytes;
        if (sortBy === 'size_asc') return a.sizeBytes - b.sizeBytes;
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        return 0;
      });
  }, [items, selectedCategory, filterDirection, filterJunkOnly, filterDuplicatesOnly, searchQuery, sortBy]);

  // Selected totals
  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  const selectedBytes = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.sizeBytes, 0);
  }, [selectedItems]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(new Set(filteredItems.map((item) => item.id)));
  };

  const selectJunkOnlyFiltered = () => {
    const junk = filteredItems.filter((i) => i.isJunkRecommended);
    setSelectedIds(new Set(junk.map((i) => i.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    onDeleteItems(Array.from(selectedIds));
    clearSelection();
  };

  const handleExportSelected = () => {
    if (selectedItems.length === 0) return;
    const manifest = selectedItems
      .map((i) => `${i.name} (${formatBytes(i.sizeBytes)}) - ${i.chatOrigin} [${i.path}]`)
      .join('\n');
    const blob = new Blob([manifest], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WhatsApp_Clean_Manifest_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories: { key: MediaCategory | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'All Files', count: items.length },
    { key: 'images', label: 'Images', count: items.filter((i) => i.category === 'images').length },
    { key: 'videos', label: 'Videos', count: items.filter((i) => i.category === 'videos').length },
    { key: 'voice_notes', label: 'Voice Notes', count: items.filter((i) => i.category === 'voice_notes').length },
    { key: 'documents', label: 'Documents', count: items.filter((i) => i.category === 'documents').length },
    { key: 'statuses', label: 'Status Cache', count: items.filter((i) => i.category === 'statuses').length },
    { key: 'stickers', label: 'Stickers', count: items.filter((i) => i.category === 'stickers').length },
    { key: 'backups', label: 'Backups', count: items.filter((i) => i.category === 'backups').length },
    { key: 'cache', label: 'Temp & Logs', count: items.filter((i) => i.category === 'cache').length },
  ];

  const getCategoryIcon = (category: MediaCategory) => {
    switch (category) {
      case 'images':
        return <Image className="w-5 h-5 text-emerald-500" />;
      case 'videos':
        return <Film className="w-5 h-5 text-blue-500" />;
      case 'voice_notes':
        return <Mic className="w-5 h-5 text-purple-500" />;
      case 'documents':
        return <FileText className="w-5 h-5 text-amber-500" />;
      case 'statuses':
        return <Layers className="w-5 h-5 text-pink-500" />;
      case 'stickers':
        return <Sparkles className="w-5 h-5 text-cyan-500" />;
      case 'backups':
        return <Database className="w-5 h-5 text-red-500" />;
      case 'cache':
        return <Archive className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Pills / Segmented Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              onSelectCategory(cat.key);
              clearSelection();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                selectedCategory === cat.key
                  ? 'bg-emerald-700/60 text-emerald-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Control Bar: Search, Filters, Sort, View Toggle */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by file name or chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Junk toggle */}
          <button
            onClick={() => setFilterJunkOnly(!filterJunkOnly)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              filterJunkOnly
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended Junk</span>
          </button>

          {/* Duplicates toggle */}
          <button
            onClick={() => setFilterDuplicatesOnly(!filterDuplicatesOnly)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              filterDuplicatesOnly
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicates</span>
          </button>

          {/* Direction Filter */}
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Sent & Received</option>
            <option value="sent">Sent Copies Only</option>
            <option value="received">Received Only</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="size_desc">Largest Size</option>
            <option value="size_asc">Smallest Size</option>
            <option value="date_desc">Newest Date</option>
            <option value="date_asc">Oldest Date</option>
          </select>

          {/* View mode */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Selection Utility Row */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-900 dark:text-white tabular-nums">{filteredItems.length}</strong> items
          </span>
          <span>·</span>
          <span>
            Total size:{' '}
            <strong className="text-slate-900 dark:text-white tabular-nums">
              {formatBytes(filteredItems.reduce((acc, i) => acc + i.sizeBytes, 0))}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={selectAllFiltered}
            className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors font-medium"
          >
            Select All
          </button>
          <button
            onClick={selectJunkOnlyFiltered}
            className="hover:text-amber-500 transition-colors font-medium"
          >
            Select Junk Only
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={clearSelection}
              className="text-red-500 hover:underline font-medium"
            >
              Clear ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Sticky Floating Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-30 bg-slate-900 text-white rounded-xl p-3 px-4 shadow-xl border border-slate-700 flex items-center justify-between gap-4 animate-scale-up">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="text-xs font-medium">
              Files selected · Reclaiming{' '}
              <strong className="text-emerald-400 tabular-nums">{formatBytes(selectedBytes)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSelected}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export List</span>
            </button>
            <button
              onClick={handleBatchDelete}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-red-600/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge {formatBytes(selectedBytes)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No files matched your filters
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search query, toggling off filters, or selecting a different folder.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterJunkOnly(false);
              setFilterDuplicatesOnly(false);
              setFilterDirection('all');
              onSelectCategory('all');
            }}
            className="px-4 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const theme = getCategoryTheme(item.category);

            return (
              <div
                key={item.id}
                onClick={() => onPreviewItem(item)}
                className={`group relative rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer bg-white dark:bg-slate-900 hover:shadow-md ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Top badges & Select Checkbox */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <button
                    onClick={(e) => toggleSelect(item.id, e)}
                    className="p-1 -m-1 text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400" />
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    {item.isJunkRecommended && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold" title="Safe recommended junk">
                        Junk
                      </span>
                    )}
                    {item.isDuplicate && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold" title="Duplicate copy">
                        Copy
                      </span>
                    )}
                  </div>
                </div>

                {/* Media Icon / Center Preview representation */}
                <div className="aspect-square w-full rounded-lg bg-slate-50 dark:bg-slate-950/60 flex flex-col items-center justify-center p-3 mb-2 border border-slate-100 dark:border-slate-800/80 group-hover:bg-slate-100/70 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
                    {getCategoryIcon(item.category)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {formatBytes(item.sizeBytes)}
                  </span>
                  {item.durationSeconds && (
                    <span className="text-[9px] font-mono text-slate-400">
                      {formatDuration(item.durationSeconds)}
                    </span>
                  )}
                </div>

                {/* File Details */}
                <div className="space-y-0.5">
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-white truncate" title={item.name}>
                    {item.name}
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate" title={item.chatOrigin}>
                    {item.chatOrigin}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>{formatDate(item.date)}</span>
                    <span className="flex items-center gap-0.5">
                      {item.direction === 'sent' ? (
                        <span title="Sent media clone">
                          <ArrowUpRight className="w-3 h-3 text-blue-400" />
                        </span>
                      ) : (
                        <span title="Received media">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredItems.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => onPreviewItem(item)}
                className={`p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                  isSelected ? 'bg-emerald-500/5' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={(e) => toggleSelect(item.id, e)}
                    className="p-1 text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>

                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </span>
                      {item.isJunkRecommended && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-semibold shrink-0">
                          Junk
                        </span>
                      )}
                      {item.isDuplicate && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 font-semibold shrink-0">
                          Copy
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                      <span className="truncate">{item.chatOrigin}</span>
                      <span>·</span>
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block tabular-nums">
                      {formatBytes(item.sizeBytes)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {item.direction === 'sent' ? 'Sent' : 'Received'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItems([item.id]);
                    }}
                    title="Delete item"
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
