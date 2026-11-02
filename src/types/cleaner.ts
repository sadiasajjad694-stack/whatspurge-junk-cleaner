export type MediaCategory =
  | 'images'
  | 'videos'
  | 'voice_notes'
  | 'documents'
  | 'statuses'
  | 'stickers'
  | 'backups'
  | 'cache';

export interface WhatsAppMediaItem {
  id: string;
  name: string;
  path: string;
  category: MediaCategory;
  sizeBytes: number; // in bytes
  date: string; // ISO date
  chatOrigin: string; // e.g. "Family Group (24 members)"
  direction: 'received' | 'sent';
  isDuplicate?: boolean;
  duplicateGroupId?: string;
  isJunkRecommended?: boolean;
  thumbnailUrl?: string;
  mimeType: string;
  durationSeconds?: number; // for audio/video
  resolution?: string; // e.g. "1920x1080"
  checksum?: string;
  realFile?: File; // when user uploads real files
}

export interface StorageStats {
  totalDeviceBytes: number; // e.g. 128 GB
  usedDeviceBytes: number; // e.g. 96 GB
  whatsAppTotalBytes: number; // sum of all whatsapp media
  junkRecommendedBytes: number; // sum of safe junk
  categoryBreakdown: Record<MediaCategory, { bytes: number; count: number }>;
}

export interface CleaningRule {
  id: string;
  title: string;
  description: string;
  category: MediaCategory | 'all';
  enabled: boolean;
  potentialSavingsBytes: number;
}

export interface CleaningLog {
  id: string;
  timestamp: string;
  filesDeletedCount: number;
  bytesReclaimed: number;
  categoriesPurged: MediaCategory[];
}
