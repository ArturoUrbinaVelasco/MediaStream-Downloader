import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Video, Music, Sparkles, ChevronDown, ChevronUp, Download } from 'lucide-react';
import type { FormatPreset, MediaMetadata } from '../types';

interface FormatSelectorProps {
  metadata: MediaMetadata;
  onSelectFormat: (preset: FormatPreset, customFormatId?: string) => void;
  isDownloading: boolean;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  onSelectFormat,
  isDownloading,
}) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="w-full flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {t('preview.formatChoice')}
      </span>

      {/* Primary 1-Click Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Best Video HD */}
        <button
          onClick={() => onSelectFormat('video_best')}
          disabled={isDownloading}
          className="group relative flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent hover:from-indigo-500/20 hover:via-purple-500/15 border-2 border-indigo-500/30 hover:border-indigo-500 dark:border-indigo-400/30 dark:hover:border-indigo-400 text-left transition-all active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-zinc-900 dark:text-white">
                  {t('presets.video_best.title')}
                </span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t('presets.video_best.subtitle')}
              </p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </div>
        </button>

        {/* Best Audio MP3 HQ */}
        <button
          onClick={() => onSelectFormat('audio_best')}
          disabled={isDownloading}
          className="group relative flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent hover:from-pink-500/20 hover:via-purple-500/15 border-2 border-pink-500/30 hover:border-pink-500 dark:border-pink-400/30 dark:hover:border-pink-400 text-left transition-all active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/30 group-hover:scale-105 transition-transform">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-zinc-900 dark:text-white">
                  {t('presets.audio_best.title')}
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400">
                  HQ
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t('presets.audio_best.subtitle')}
              </p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-pink-600/10 dark:bg-pink-400/10 text-pink-600 dark:text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Advanced Resolution Accordion */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <span>{showAdvanced ? 'Ocultar más resoluciones' : 'Ver más resoluciones y formatos'}</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => onSelectFormat('video_1080p')}
              disabled={isDownloading}
              className="p-2.5 rounded-xl text-left bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer text-xs"
            >
              <span className="font-bold block text-zinc-900 dark:text-white">
                {t('presets.video_1080p.title')}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                {t('presets.video_1080p.subtitle')}
              </span>
            </button>

            <button
              onClick={() => onSelectFormat('video_720p')}
              disabled={isDownloading}
              className="p-2.5 rounded-xl text-left bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer text-xs"
            >
              <span className="font-bold block text-zinc-900 dark:text-white">
                {t('presets.video_720p.title')}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                {t('presets.video_720p.subtitle')}
              </span>
            </button>

            <button
              onClick={() => onSelectFormat('audio_128k')}
              disabled={isDownloading}
              className="p-2.5 rounded-xl text-left bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer text-xs"
            >
              <span className="font-bold block text-zinc-900 dark:text-white">
                {t('presets.audio_128k.title')}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                {t('presets.audio_128k.subtitle')}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
