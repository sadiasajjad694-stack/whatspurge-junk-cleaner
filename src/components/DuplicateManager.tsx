import React, { useState, useMemo } from 'react';
import { Copy, Trash2, CheckCircle2, ArrowRight, ShieldCheck, Film, Image, Sparkles } from 'lucide-react';
import { WhatsAppMediaItem } from '../types/cleaner';
import { formatBytes, formatDate } from '../utils/formatters';

interface DuplicateManagerProps {
  items: WhatsAppMediaItem[];
  onDeleteItems: (ids: string[]) => void;
  onPreviewItem: (item: WhatsAppMediaItem) => void;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({
  items,
  onDeleteItems,
  onPreviewItem,
}) => {
  // Group duplicate items by duplicateGroupId
  const duplicateGroups = useMemo(() => {
    const groups: Record<string, WhatsAppMediaItem[]> = {};
    items.forEach((item) => {
      if (item.isDuplicate && item.duplicateGroupId) {
        if (!groups[item.duplicateGroupId]) {
          groups[item.duplicateGroupId] = [];
        }
        groups[item.duplicateGroupId].push(item);
      }
    });

    return Object.entries(groups)
      .filter(([_, groupItems]) => groupItems.length > 1)
      .map(([groupId, groupItems]) => {
        // Sort: earliest date first (considered original master copy)
        const sorted = [...groupItems].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const original = sorted[0];
        const duplicates = sorted.slice(1);
        const duplicateBytes = duplicates.reduce((acc, i) => acc + i.sizeBytes, 0);

        return {
          groupId,
          original,
          duplicates,
          totalCount: groupItems.length,
          duplicateBytes,
          fileSize: original.sizeBytes,
          category: original.category,
        };
      })
      .sort((a, b) => b.duplicateBytes - a.duplicateBytes);
  }, [items]);

  // Track which duplicate IDs are selected to purge
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    // Default: select all secondary duplicates, leaving originals safe
    const initial = new Set<string>();
    duplicateGroups.forEach((g) => {
      g.duplicates.forEach((d) => initial.add(d.id));
    });
    return initial;
  });

  const totalRecoverableBytes = useMemo(() => {
    return duplicateGroups.reduce((acc, g) => acc + g.duplicateBytes, 0);
  }, [duplicateGroups]);

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

  const handleCleanDuplicates = () => {
    if (selectedIds.size === 0) return;
    onDeleteItems(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleSelectAllDuplicates = () => {
    const next = new Set<string>();
    duplicateGroups.forEach((g) => {
      g.duplicates.forEach((d) => next.add(d.id));
    });
    setSelectedIds(next);
  };

  if (duplicateGroups.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          No Duplicate WhatsApp Media Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          All photos, forwarded meme videos, and documents are unique single copies. No extra storage is wasted on duplicate forwards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Copy className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Duplicate Media Manager
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Detected <span className="font-semibold text-slate-800 dark:text-slate-200">{duplicateGroups.length}</span> duplicate sets wasting{' '}
            <strong className="text-blue-500 tabular-nums">{formatBytes(totalRecoverableBytes)}</strong>. We keep the original and purge the repeated forwards.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <button
            onClick={handleSelectAllDuplicates}
            className="py-2.5 px-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Select All Copies
          </button>
          <button
            onClick={handleCleanDuplicates}
            disabled={selectedIds.size === 0}
            className={`py-2.5 px-4 text-xs font-bold text-white rounded-xl transition-all shadow-md flex items-center gap-2 ${
              selectedIds.size > 0
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge {formatBytes(selectedBytes)}</span>
          </button>
        </div>
      </div>

      {/* Duplicate Sets List */}
      <div className="space-y-4">
        {duplicateGroups.map((group, idx) => (
          <div
            key={group.groupId}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
          >
            {/* Top row of group */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Duplicate Cluster #{idx + 1}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {group.totalCount} copies ({formatBytes(group.fileSize)} each)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-500 tabular-nums">
                Save {formatBytes(group.duplicateBytes)}
              </span>
            </div>

            {/* Copies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Master Copy (Keep) */}
              <div
                onClick={() => onPreviewItem(group.original)}
                className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 flex flex-col justify-between cursor-pointer hover:border-emerald-500 transition-all relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Master Original (Keep)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(group.original.date)}
                  </span>
                </div>

                <div className="space-y-1 mb-2">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {group.original.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Origin: {group.original.chatOrigin}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    {group.original.path}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-emerald-500/10">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Protected
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatBytes(group.original.sizeBytes)}
                  </span>
                </div>
              </div>

              {/* Duplicate Clones (Purgeable) */}
              {group.duplicates.map((dup) => {
                const isSelected = selectedIds.has(dup.id);
                return (
                  <div
                    key={dup.id}
                    onClick={() => onPreviewItem(dup)}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-red-500/40 bg-red-500/5 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        <span>Duplicate Forward</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(dup.date)}
                      </span>
                    </div>

                    <div className="space-y-1 mb-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {dup.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Forwarded to: {dup.chatOrigin}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        {dup.path}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(dup.id);
                        }}
                        className={`font-semibold transition-colors ${
                          isSelected ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {isSelected ? 'Marked for deletion' : 'Click to select'}
                      </button>
                      <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {formatBytes(dup.sizeBytes)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
