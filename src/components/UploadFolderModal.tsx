import React, { useRef, useState } from 'react';
import { X, Upload, FolderUp, FileUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { WhatsAppMediaItem, MediaCategory } from '../types/cleaner';
import { formatBytes } from '../utils/formatters';

interface UploadFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRealFiles: (items: WhatsAppMediaItem[]) => void;
  onResetDemoData: () => void;
  isRealDataActive: boolean;
}

export const UploadFolderModal: React.FC<UploadFolderModalProps> = ({
  isOpen,
  onClose,
  onImportRealFiles,
  onResetDemoData,
  isRealDataActive,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileCountAdded, setFileCountAdded] = useState<number | null>(null);

  if (!isOpen) return null;

  const determineCategory = (name: string, type: string): MediaCategory => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (name.includes('status') || name.startsWith('status_')) return 'statuses';
    if (ext === 'crypt14' || ext === 'crypt12' || ext === 'db' || name.includes('msgstore')) return 'backups';
    if (['opus', 'ogg', 'm4a', 'aac'].includes(ext) || name.includes('PTT-') || name.includes('AUD-')) return 'voice_notes';
    if (['mp4', 'mkv', 'mov', '3gp', 'avi', 'webm'].includes(ext) || type.startsWith('video/')) return 'videos';
    if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext) || type.startsWith('image/')) return 'images';
    if (['pdf', 'docx', 'xlsx', 'pptx', 'txt'].includes(ext) || type.includes('pdf')) return 'documents';
    if (['tmp', 'part', 'log', 'trace'].includes(ext) || name.startsWith('.')) return 'cache';
    return 'cache';
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const newItems: WhatsAppMediaItem[] = [];
    const sizeMap = new Map<number, string>(); // to detect duplicate sizes

    Array.from(files).forEach((file, index) => {
      const category = determineCategory(file.name, file.type);
      const isDuplicate = sizeMap.has(file.size);
      let dupGroupId: string | undefined;

      if (isDuplicate) {
        dupGroupId = `dup-${file.size}`;
      } else {
        sizeMap.set(file.size, file.name);
      }

      const isJunkRecommended =
        category === 'statuses' ||
        category === 'cache' ||
        (category === 'backups' && index > 0) ||
        isDuplicate;

      newItems.push({
        id: `real-${Date.now()}-${index}`,
        name: file.name,
        path: (file as any).webkitRelativePath || `/Storage/${file.name}`,
        category,
        sizeBytes: file.size,
        date: new Date(file.lastModified).toISOString(),
        chatOrigin: (file as any).webkitRelativePath ? 'Imported Folder' : 'Custom Upload',
        direction: file.name.includes('Sent') ? 'sent' : 'received',
        mimeType: file.type || 'application/octet-stream',
        isDuplicate,
        duplicateGroupId: dupGroupId,
        isJunkRecommended,
        realFile: file,
      });
    });

    onImportRealFiles(newItems);
    setFileCountAdded(newItems.length);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Inspect Real WhatsApp Media &amp; Files
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Analyze your actual device files, calculate sizes, and detect duplicates
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

        {/* Upload Body */}
        <div className="p-6 space-y-4">
          {fileCountAdded !== null && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Loaded {fileCountAdded} real files into the storage cleaner!</span>
            </div>
          )}

          {/* Hidden inputs */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <input
            type="file"
            ref={folderInputRef}
            // @ts-ignore
            webkitdirectory="true"
            // @ts-ignore
            directory="true"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-8 text-center transition-colors bg-slate-50/50 dark:bg-slate-950/40"
          >
            <FolderUp className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Drag &amp; drop WhatsApp folder or files here
            </h4>
            <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
              Drop your phone's WhatsApp backup folder or media files to run live duplicate &amp; junk analysis.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                disabled={isProcessing}
                className="py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
              >
                Select Media Folder
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Select Individual Files
              </button>
            </div>
          </div>

          {/* Reset or Switch back to Demo Data */}
          {isRealDataActive && (
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-slate-400">Currently analyzing custom files</span>
              <button
                onClick={() => {
                  onResetDemoData();
                  setFileCountAdded(null);
                  onClose();
                }}
                className="text-emerald-500 hover:underline font-semibold"
              >
                Restore WhatsApp Sample Dataset
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
