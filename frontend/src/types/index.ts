export type PlatformType =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'vimeo'
  | 'twitch'
  | 'soundcloud'
  | 'generic';

export type FormatPreset =
  | 'video_best'
  | 'video_1080p'
  | 'video_720p'
  | 'audio_best'
  | 'audio_128k';

export interface MediaFormat {
  format_id: string;
  ext: string;
  resolution?: string;
  filesize?: number;
  has_video: boolean;
  has_audio: boolean;
  quality_label?: string;
}

export interface MediaMetadata {
  id: string;
  url: string;
  title: string;
  uploader: string;
  duration: number;
  thumbnail?: string;
  platform: PlatformType;
  available_formats: MediaFormat[];
  view_count?: number;
  description?: string;
}

export interface ProgressEventPayload {
  task_id: string;
  status: 'starting' | 'downloading' | 'processing' | 'finished' | 'error';
  percent: number;
  speed?: string;
  eta?: number;
  downloaded_bytes?: number;
  total_bytes?: number;
  filename?: string;
  error?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  uploader: string;
  thumbnail?: string;
  duration: number;
  platform: PlatformType;
  preset: FormatPreset;
  filename: string;
  timestamp: number;
}
