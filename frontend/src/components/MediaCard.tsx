import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Eye, User } from 'lucide-react';
import type { MediaMetadata, FormatPreset } from '../types';
import { FormatSelector } from './FormatSelector';

interface MediaCardProps {
  metadata: MediaMetadata;
  onSelectFormat: (preset: FormatPreset, customFormatId?: string) => void;
  isDownloading: boolean;
}

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}:${remainingMins < 10 ? '0' : ''}${remainingMins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatViews = (views?: number): string => {
  if (!views) return '';
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
};

export const MediaCard: React.FC<MediaCardProps> = ({
  metadata,
  onSelectFormat,
  isDownloading,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xl shadow-indigo-500/5 flex flex-col gap-5 transition-all">
      {/* Top Preview */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 aspect-video rounded-2xl overflow-hidden bg-zinc-800 shrink-0 shadow-md">
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
              No Preview
            </div>
          )}
          {metadata.duration > 0 && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[11px] font-semibold text-white">
              {formatDuration(metadata.duration)}
            </span>
          )}
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-indigo-600/90 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
            {metadata.platform}
          </span>
        </div>

        {/* Media Details */}
        <div className="flex flex-col justify-between h-full w-full">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug">
              {metadata.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                {metadata.uploader}
              </span>
              {metadata.view_count && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {formatViews(metadata.view_count)} {t('preview.views')}
                </span>
              )}
              {metadata.duration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(metadata.duration)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-zinc-100 dark:border-zinc-800" />

      {/* Format Selector */}
      <FormatSelector
        metadata={metadata}
        onSelectFormat={onSelectFormat}
        isDownloading={isDownloading}
      />
    </div>
  );
};
