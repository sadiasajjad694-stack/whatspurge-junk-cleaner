import { MediaCategory } from '../types/cleaner';

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${value} ${sizes[i]}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  } catch {
    return isoString;
  }
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function getCategoryLabel(category: MediaCategory): string {
  switch (category) {
    case 'images':
      return 'Images';
    case 'videos':
      return 'Videos';
    case 'voice_notes':
      return 'Voice Notes';
    case 'documents':
      return 'Documents & PDFs';
    case 'statuses':
      return 'Status Cache';
    case 'stickers':
      return 'Stickers & GIFs';
    case 'backups':
      return 'DB Backups';
    case 'cache':
      return 'Temp Cache & Logs';
  }
}

export function getCategoryFolder(category: MediaCategory): string {
  switch (category) {
    case 'images':
      return '/WhatsApp/Media/WhatsApp Images';
    case 'videos':
      return '/WhatsApp/Media/WhatsApp Video';
    case 'voice_notes':
      return '/WhatsApp/Media/WhatsApp Voice Notes';
    case 'documents':
      return '/WhatsApp/Media/WhatsApp Documents';
    case 'statuses':
      return '/WhatsApp/Media/.Statuses';
    case 'stickers':
      return '/WhatsApp/Media/WhatsApp Stickers';
    case 'backups':
      return '/WhatsApp/Databases';
    case 'cache':
      return '/WhatsApp/Media/.Shared/temp';
  }
}

export function getCategoryTheme(category: MediaCategory) {
  switch (category) {
    case 'images':
      return {
        accent: '#10b981', // emerald-500
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        badge: 'text-emerald-400 bg-emerald-950/60',
      };
    case 'videos':
      return {
        accent: '#3b82f6', // blue-500
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        badge: 'text-blue-400 bg-blue-950/60',
      };
    case 'voice_notes':
      return {
        accent: '#8b5cf6', // purple-500
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        badge: 'text-purple-400 bg-purple-950/60',
      };
    case 'documents':
      return {
        accent: '#f59e0b', // amber-500
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        badge: 'text-amber-400 bg-amber-950/60',
      };
    case 'statuses':
      return {
        accent: '#ec4899', // pink-500
        text: 'text-pink-400',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        badge: 'text-pink-400 bg-pink-950/60',
      };
    case 'stickers':
      return {
        accent: '#06b6d4', // cyan-500
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        badge: 'text-cyan-400 bg-cyan-950/60',
      };
    case 'backups':
      return {
        accent: '#ef4444', // red-500
        text: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        badge: 'text-red-400 bg-red-950/60',
      };
    case 'cache':
      return {
        accent: '#64748b', // slate-500
        text: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        badge: 'text-slate-400 bg-slate-900/60',
      };
  }
}
