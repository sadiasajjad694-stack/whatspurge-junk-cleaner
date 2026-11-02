import React, { useState, useMemo } from 'react';
import { Film, Trash2, Download, AlertCircle, ArrowUpRight, ArrowDownLeft, FileText, Database } from 'lucide-react';
import { WhatsAppMediaItem } from '../types/cleaner';
import { formatBytes, formatDate, formatDuration, getCategoryLabel } from '../utils/formatters';

interface LargeFilesHunterProps {
  items: WhatsAppMediaItem[];
  onDeleteItems: (ids: string[]) => void;
  onPreviewItem: (item: WhatsAppMediaItem) => void;
}

export const LargeFilesHunter: React.FC<LargeFilesHunterProps> = ({
  items,
  onDeleteItems,
  onPreviewItem,
}) => {
  const [thresholdMb, setThresholdMb] = useState<number>(20); // 20MB default
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const thresholdBytes = thresholdMb * 1024 * 1024;

  const largeFiles = useMemo(() => {
    return items
      .filter((item) => item.sizeBytes >= thresholdBytes)
      .sort((a, b) => b.sizeBytes - a.sizeBytes);
  }, [items, thresholdBytes]);

  const totalLargeBytes = useMemo(() => {
    return largeFiles.reduce((acc, item) => acc + item.sizeBytes, 0);
  }, [largeFiles]);

  const selectedBytes = useMemo(() => {
    return items
      .filter((i) => selectedIds.has(i.id))
      .reduce((acc, i) => acc + i.sizeBytes, 0);
  }, [items, selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(largeFiles.map((i) => i.id)));
  };

  const handleClear = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    onDeleteItems(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Banner & Threshold Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
              <Film className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Large Media & Heavy Files Hunter
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Identify the single biggest storage hogs consuming gigabytes in seconds.
          </p>
        </div>

        {/* Threshold Segmented Control */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setThresholdMb(10)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              thresholdMb === 10
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            &gt; 10 MB
          </button>
          <button
            onClick={() => setThresholdMb(20)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              thresholdMb === 20
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            &gt; 20 MB
          </button>
          <button
            onClick={() => setThresholdMb(50)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              thresholdMb === 50
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            &gt; 50 MB
          </button>
        </div>
      </div>

      {/* Summary Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>
            Found <strong className="text-slate-900 dark:text-white tabular-nums">{largeFiles.length}</strong> heavy files
          </span>
          <span>·</span>
          <span>
            Consuming <strong className="text-red-500 font-bold tabular-nums">{formatBytes(totalLargeBytes)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Select All
          </button>
          {selectedIds.size > 0 && (
            <button onClick={handleClear} className="font-medium text-slate-400 hover:underline">
              Clear
            </button>
          )}
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Selected ({formatBytes(selectedBytes)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Large Files Cards List */}
      <div className="space-y-3">
        {largeFiles.map((item) => {
          const isSelected = selectedIds.has(item.id);

          return (
            <div
              key={item.id}
              onClick={() => onPreviewItem(item)}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all cursor-pointer hover:shadow-md ${
                isSelected
                  ? 'border-red-500 ring-2 ring-red-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-700"
                />

                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {item.category === 'backups' ? (
                    <Database className="w-6 h-6 text-red-500" />
                  ) : item.category === 'documents' ? (
                    <FileText className="w-6 h-6 text-amber-500" />
                  ) : (
                    <Film className="w-6 h-6 text-blue-500" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    {item.isJunkRecommended && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-semibold shrink-0">
                        Recommended Junk
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    Chat: {item.chatOrigin} · {formatDate(item.date)}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 truncate">
                    {item.path}
                  </p>
                </div>
              </div>

              {/* Size & Action */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums block font-mono">
                    {formatBytes(item.sizeBytes)}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {item.durationSeconds ? formatDuration(item.durationSeconds) : getCategoryLabel(item.category)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItems([item.id]);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
