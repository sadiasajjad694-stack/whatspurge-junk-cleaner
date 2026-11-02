import React from 'react';
import { X, Trash2, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { WhatsAppMediaItem } from '../types/cleaner';
import { formatBytes, formatDate } from '../utils/formatters';

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  trashItems: WhatsAppMediaItem[];
  onRestoreItem: (id: string) => void;
  onRestoreAll: () => void;
  onEmptyTrash: () => void;
}

export const RecycleBinModal: React.FC<RecycleBinModalProps> = ({
  isOpen,
  onClose,
  trashItems,
  onRestoreItem,
  onRestoreAll,
  onEmptyTrash,
}) => {
  if (!isOpen) return null;

  const totalTrashBytes = trashItems.reduce((acc, item) => acc + item.sizeBytes, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recycle Bin & Safe Recovery
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Purged files remain recoverable here before permanent deletion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {trashItems.length === 0 ? (
            <div className="py-12 text-center">
              <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Recycle Bin is Empty
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No files are currently in the trash. Cleaned files will appear here for safe recovery.
              </p>
            </div>
          ) : (
            trashItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h5>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.chatOrigin} · {formatDate(item.date)}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatBytes(item.sizeBytes)}
                  </span>
                  <button
                    onClick={() => onRestoreItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-emerald-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    title="Restore file"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {trashItems.length > 0 && (
          <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total in trash: <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{formatBytes(totalTrashBytes)}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onRestoreAll}
                className="py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore All</span>
              </button>
              <button
                onClick={onEmptyTrash}
                className="py-2 px-3 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Permanently</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
