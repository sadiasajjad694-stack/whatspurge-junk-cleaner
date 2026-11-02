import React from 'react';
import { X, CheckCircle2, Smartphone, ShieldCheck, Download, Clock, Sliders } from 'lucide-react';

interface WhatsappGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsappGuideModal: React.FC<WhatsappGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                How to Stop WhatsApp from Filling Storage
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official in-app configuration steps for Android & iOS
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Step 1 */}
          <div className="flex gap-4">
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Disable "Media Auto-Download"</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                By default, WhatsApp automatically saves every photo, video, and audio note from groups directly onto your phone storage.
              </p>
              <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono">
                WhatsApp &gt; Settings &gt; Storage and Data &gt; Media Auto-Download &gt; Set Photos, Videos &amp; Audio to <strong>"No Media" (Off)</strong>.
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Turn on "Disappearing Messages" for Busy Groups
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                School, neighborhood, and meme groups generate dozens of megabytes daily that you will never look at again.
              </p>
              <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono">
                Open Group Info &gt; Disappearing Messages &gt; Select <strong>7 Days</strong> or <strong>90 Days</strong>.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Review WhatsApp's Native "Manage Storage"
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                WhatsApp has a built-in breakdown sorted by largest chat threads:
              </p>
              <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono">
                WhatsApp &gt; Settings &gt; Storage and Data &gt; <strong>Manage Storage</strong> &gt; Review "Larger than 5MB" and "Forwarded many times".
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>WhatsPurge safely cleans status caches, duplicate forwards, and old backups without deleting your active chat history.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
