import React, { useState } from 'react';
import { X, Trash2, Download, Play, Pause, FileText, Database, Radio, Music, Eye, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { WhatsAppMediaItem } from '../types/cleaner';
import { formatBytes, formatDate, formatDuration, getCategoryLabel, getCategoryTheme } from '../utils/formatters';

interface MediaPreviewModalProps {
  item: WhatsAppMediaItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  item,
  onClose,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);

  if (!item) return null;

  const theme = getCategoryTheme(item.category);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    // Generate text/dummy file download for real responsiveness
    const element = document.createElement('a');
    const file = new Blob([`WhatsApp File Export: ${item.name}\nSize: ${formatBytes(item.sizeBytes)}\nChat: ${item.chatOrigin}`], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = item.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 truncate">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: theme.accent }}
            />
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {item.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {getCategoryLabel(item.category)} · {item.path}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Viewport */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-slate-950/20 dark:bg-black/40 min-h-[260px]">
          {/* Images or Status Images */}
          {(item.category === 'images' || (item.category === 'statuses' && item.mimeType.startsWith('image/')) || item.category === 'stickers') && (
            <div className="relative w-full max-w-md aspect-video sm:aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-6 text-center shadow-inner">
              {/* Graphic simulated preview */}
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg"
                style={{ backgroundColor: theme.accent }}
              >
                <Eye className="w-12 h-12" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">
                {item.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{item.resolution || 'High Resolution'}</span>
                <span>·</span>
                <span>{formatBytes(item.sizeBytes)}</span>
              </div>
            </div>
          )}

          {/* Videos */}
          {(item.category === 'videos' || (item.category === 'statuses' && item.mimeType.startsWith('video/'))) && (
            <div className="relative w-full max-w-md aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">{item.resolution || '1080p'}</span>
                <span className="font-mono">{formatDuration(item.durationSeconds)}</span>
              </div>

              {/* Center Play Button */}
              <div className="self-center my-auto">
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
              </div>

              {/* Bottom Video Progress Scrub */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: isPlaying ? '68%' : '25%' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{isPlaying ? '0:48' : '0:12'}</span>
                  <span>{formatDuration(item.durationSeconds)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Voice Notes */}
          {item.category === 'voice_notes' && (
            <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <span className="text-xs text-slate-400 block font-medium">WhatsApp Audio Note</span>
                  <span className="text-sm font-bold text-white block">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-400 block tabular-nums">
                    {formatDuration(item.durationSeconds)}
                  </span>
                  <span className="text-[11px] text-slate-500 block tabular-nums">
                    {formatBytes(item.sizeBytes)}
                  </span>
                </div>
              </div>

              {/* Animated / Interactive Waveform */}
              <div className="h-14 flex items-end gap-1 px-2 py-1 bg-slate-950/70 rounded-xl">
                {Array.from({ length: 36 }).map((_, i) => {
                  const height = Math.max(12, Math.sin(i * 0.5) * 35 + 20);
                  const isPast = (i / 36) * 100 <= (isPlaying ? 65 : audioProgress);
                  return (
                    <div
                      key={i}
                      onClick={() => setAudioProgress((i / 36) * 100)}
                      className={`flex-1 rounded-full cursor-pointer transition-all duration-150 ${
                        isPast ? 'bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents / Backups / Cache */}
          {(item.category === 'documents' || item.category === 'backups' || item.category === 'cache') && (
            <div className="w-full max-w-md p-6 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-md"
                style={{ backgroundColor: theme.accent }}
              >
                {item.category === 'backups' ? (
                  <Database className="w-8 h-8" />
                ) : (
                  <FileText className="w-8 h-8" />
                )}
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                {item.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {item.category === 'backups'
                  ? 'Local WhatsApp Database encrypted with crypt14'
                  : item.mimeType}
              </p>
              <div className="inline-block py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                Size on disk: {formatBytes(item.sizeBytes)}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Metadata Grid */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Chat Origin</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                {item.chatOrigin}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Transfer Type</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                {item.direction === 'sent' ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sent (in /Sent folder)</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Received</span>
                  </>
                )}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Date Created</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formatDate(item.date)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Clean Status</span>
              <span className={`font-semibold ${item.isJunkRecommended ? 'text-amber-500' : 'text-slate-500'}`}>
                {item.isJunkRecommended ? 'Recommended to Purge' : 'Regular Media'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export / Backup File</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Keep File
            </button>
            <button
              onClick={() => {
                onDelete(item.id);
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 flex items-center gap-1.5 transition-colors shadow-sm shadow-red-600/20"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge {formatBytes(item.sizeBytes)}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
