import React, { useState } from 'react';
import { Sliders, ShieldCheck, Check, Sparkles, AlertCircle, HelpCircle, ArrowRight, Settings } from 'lucide-react';
import { CleaningRule } from '../types/cleaner';
import { formatBytes } from '../utils/formatters';

interface AutoCleanRulesProps {
  rules: CleaningRule[];
  onToggleRule: (id: string) => void;
  onApplyRules: () => void;
  onOpenWhatsappGuide: () => void;
}

export const AutoCleanRules: React.FC<AutoCleanRulesProps> = ({
  rules,
  onToggleRule,
  onApplyRules,
  onOpenWhatsappGuide,
}) => {
  const [scheduledFrequency, setScheduledFrequency] = useState<'daily' | 'weekly' | 'biweekly'>('weekly');
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeRulesSavings = rules
    .filter((r) => r.enabled)
    .reduce((acc, r) => acc + r.potentialSavingsBytes, 0);

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      onApplyRules();
      setIsApplying(false);
      setSuccessMessage('Active cleaning rules applied and scheduled successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Smart Storage Saver & Auto-Purge Rules
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure automated policies to keep WhatsApp lean without touching your important personal photos.
          </p>
        </div>

        <button
          onClick={handleApply}
          disabled={isApplying || activeRulesSavings === 0}
          className="py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply Active Rules ({formatBytes(activeRulesSavings)})</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-2xl border transition-all ${
              rule.enabled
                ? 'bg-white dark:bg-slate-900 border-emerald-500/40 shadow-sm'
                : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {rule.title}
              </h4>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => onToggleRule(rule.id)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                  rule.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    rule.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              {rule.description}
            </p>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Potential Recovery:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                +{formatBytes(rule.potentialSavingsBytes)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Frequency & Schedule Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Auto-Cleaning Routine Frequency
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          How frequently should WhatsPurge scan and alert you to flush status caches and redundant database snapshots?
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {(['daily', 'weekly', 'biweekly'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => setScheduledFrequency(freq)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                scheduledFrequency === freq
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Official Settings Best Practices Guide Callout */}
      <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Settings className="w-3.5 h-3.5" />
            <span>Prevent Future Junk Storage</span>
          </div>
          <h4 className="text-base font-bold text-white">
            WhatsApp Settings Storage Walkthrough
          </h4>
          <p className="text-xs text-slate-400 max-w-xl">
            Learn how to turn off WhatsApp "Media Auto-Download" and enable Disappearing Messages to prevent groups from quietly downloading gigabytes of junk into your phone.
          </p>
        </div>

        <button
          onClick={onOpenWhatsappGuide}
          className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <span>View 3-Step Guide</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
