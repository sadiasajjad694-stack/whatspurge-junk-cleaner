import React from 'react';
import { HardDrive, Trash2, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { StorageStats, MediaCategory } from '../types/cleaner';
import { formatBytes, getCategoryLabel, getCategoryTheme } from '../utils/formatters';

interface StorageGaugeProps {
  stats: StorageStats;
  onCleanJunk: () => void;
  onSelectCategory: (category: MediaCategory) => void;
  isCleaning: boolean;
}

export const StorageGauge: React.FC<StorageGaugeProps> = ({
  stats,
  onCleanJunk,
  onSelectCategory,
  isCleaning,
}) => {
  const whatsAppPercentOfDevice = Math.min(
    100,
    Math.round((stats.whatsAppTotalBytes / stats.totalDeviceBytes) * 100)
  );

  const junkPercentOfWhatsApp = stats.whatsAppTotalBytes > 0
    ? Math.round((stats.junkRecommendedBytes / stats.whatsAppTotalBytes) * 100)
    : 0;

  // Categories sorted by size
  const sortedCategories = (Object.keys(stats.categoryBreakdown) as MediaCategory[])
    .filter((cat) => stats.categoryBreakdown[cat].bytes > 0)
    .sort((a, b) => stats.categoryBreakdown[b].bytes - stats.categoryBreakdown[a].bytes);

  // SVG Gauge calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  // Arc proportion (240 degrees out of 360)
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * (junkPercentOfWhatsApp / 100));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Radial Meter */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full -rotate-[210deg] transform" viewBox="0 0 200 200">
              {/* Background Arc */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="14"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
                fill="none"
              />
              {/* Progress Arc for Junk */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="14"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Center Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                Purgeable Junk
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums my-1">
                {formatBytes(stats.junkRecommendedBytes)}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {junkPercentOfWhatsApp}% of WhatsApp Data
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Total WhatsApp size:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200 tabular-nums">
              {formatBytes(stats.whatsAppTotalBytes)}
            </span>
          </div>

          {/* Quick CTA */}
          <div className="mt-6 w-full max-w-xs">
            <button
              onClick={onCleanJunk}
              disabled={stats.junkRecommendedBytes === 0 || isCleaning}
              className={`w-full py-3 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                stats.junkRecommendedBytes > 0 && !isCleaning
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 active:scale-[0.98]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
              }`}
            >
              {isCleaning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Purging Junk Files...</span>
                </>
              ) : stats.junkRecommendedBytes > 0 ? (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Clean {formatBytes(stats.junkRecommendedBytes)} Now</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>WhatsApp is Clean</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe clean: Personal chats and latest backup kept intact</span>
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Breakdown & Device Context */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                WhatsApp Storage Distribution
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {whatsAppPercentOfDevice}% of {formatBytes(stats.totalDeviceBytes)} Storage
              </span>
            </div>

            {/* Segmented Stacked Progress Bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
              {sortedCategories.map((cat) => {
                const percent = stats.whatsAppTotalBytes > 0
                  ? (stats.categoryBreakdown[cat].bytes / stats.whatsAppTotalBytes) * 100
                  : 0;
                if (percent < 0.5) return null;
                const theme = getCategoryTheme(cat);
                return (
                  <div
                    key={cat}
                    style={{
                      width: `${percent}%`,
                      backgroundColor: theme.accent,
                    }}
                    title={`${getCategoryLabel(cat)}: ${formatBytes(stats.categoryBreakdown[cat].bytes)} (${Math.round(percent)}%)`}
                    className="h-full hover:opacity-85 transition-opacity cursor-pointer"
                    onClick={() => onSelectCategory(cat)}
                  />
                );
              })}
            </div>

            {/* Legend / Category Quick Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {sortedCategories.map((cat) => {
                const info = stats.categoryBreakdown[cat];
                const theme = getCategoryTheme(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className="p-3 text-left rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {getCategoryLabel(cat)}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatBytes(info.bytes)}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                      {info.count} items
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Storage Status Bar */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-medium text-slate-900 dark:text-slate-200">
                Phone Internal Storage
              </span>
              <span className="tabular-nums font-mono">
                {formatBytes(stats.usedDeviceBytes)} / {formatBytes(stats.totalDeviceBytes)} Used ({Math.round((stats.usedDeviceBytes / stats.totalDeviceBytes) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 dark:bg-slate-500 rounded-full"
                style={{
                  width: `${(stats.usedDeviceBytes / stats.totalDeviceBytes) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>Free space: {formatBytes(stats.totalDeviceBytes - stats.usedDeviceBytes)}</span>
              <span>WhatsApp takes {formatBytes(stats.whatsAppTotalBytes)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
