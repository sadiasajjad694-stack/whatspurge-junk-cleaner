import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, X, Search, ShieldCheck } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: () => void;
  currentJunkBytes: number;
}

const SCAN_STEPS = [
  { folder: '/Android/media/com.whatsapp/WhatsApp/Media/.Statuses', label: 'Checking hidden status cache...' },
  { folder: '/WhatsApp/Media/WhatsApp Video/Sent', label: 'Analyzing large forwarded videos and sent copies...' },
  { folder: '/WhatsApp/Media/WhatsApp Images', label: 'Computing image hashes for duplicate detection...' },
  { folder: '/WhatsApp/Databases', label: 'Auditing redundant 7-day database backups...' },
  { folder: '/WhatsApp/Media/WhatsApp Voice Notes', label: 'Scanning OPUS voice notes and audio logs...' },
  { folder: '/WhatsApp/Media/.Shared/temp', label: 'Detecting orphaned stream chunks and crash dumps...' },
];

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  currentJunkBytes,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [scannedFiles, setScannedFiles] = useState(0);
  const [scannedBytes, setScannedBytes] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setScannedFiles(0);
      setScannedBytes(0);
      setIsFinished(false);
      return;
    }

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < SCAN_STEPS.length) {
        setCurrentStepIndex(step);
        setScannedFiles((prev) => prev + Math.floor(Math.random() * 85 + 40));
        setScannedBytes((prev) => prev + Math.floor(Math.random() * 800000000 + 400000000));
      } else {
        clearInterval(interval);
        setScannedFiles(648);
        setScannedBytes(10485760000); // ~9.7 GB
        setIsFinished(true);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = SCAN_STEPS[Math.min(currentStepIndex, SCAN_STEPS.length - 1)];
  const progressPercent = Math.min(
    100,
    Math.round(((currentStepIndex + 1) / SCAN_STEPS.length) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Deep WhatsApp Storage Scanner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auditing internal directories and duplicate media
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

        {/* Scanner Content */}
        <div className="py-8 flex flex-col items-center text-center">
          {!isFinished ? (
            <>
              {/* Radar pulse animation */}
              <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-75" />
                <div className="absolute inset-2 rounded-full border border-emerald-500/30 animate-spin" />
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg">
                  <Search className="w-7 h-7 animate-pulse" />
                </div>
              </div>

              {/* Status text */}
              <div className="space-y-1 mb-6">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {currentStep.label}
                </p>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 truncate max-w-sm">
                  {currentStep.folder}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Live Scanned Stats */}
              <div className="grid grid-cols-2 gap-4 w-full text-left bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="text-[11px] text-slate-400 block">Files Inspected</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                    {scannedFiles}+
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Data Analyzed</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                    {formatBytes(scannedBytes)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-5 animate-scale-up">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Scan Completed Successfully
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mb-6">
                Discovered <span className="font-bold text-emerald-500">{formatBytes(currentJunkBytes)}</span> of redundant files ready for immediate recovery.
              </p>

              <div className="w-full bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Expired 24h Status Cache:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">72.7 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Old Redundant Backups (6 days):</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">1.86 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Orphaned Stream Parts & Trace Logs:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">104.7 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duplicate Multi-Forwarded Photos:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">70.2 MB</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onScanComplete();
                  }}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20"
                >
                  View Details & Clean
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Scans run locally on-device. No personal conversations are sent off your device.</span>
        </div>
      </div>
    </div>
  );
};
