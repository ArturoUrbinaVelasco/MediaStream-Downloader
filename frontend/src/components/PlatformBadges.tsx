import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Music,
  Video,
  PlaySquare,
  Radio,
  Tv,
  Play,
  Camera,
  Share2,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

export const PlatformBadges: React.FC = () => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  const platforms = [
    { name: 'YouTube', url: 'https://www.youtube.com', icon: Play, color: 'text-red-500 hover:border-red-500/50' },
    { name: 'TikTok', url: 'https://www.tiktok.com', icon: Music, color: 'text-cyan-400 hover:border-cyan-400/50' },
    { name: 'Instagram', url: 'https://www.instagram.com', icon: Camera, color: 'text-pink-500 hover:border-pink-500/50' },
    { name: 'X / Twitter', url: 'https://x.com', icon: Share2, color: 'text-sky-400 hover:border-sky-400/50' },
    { name: 'Facebook', url: 'https://www.facebook.com', icon: PlaySquare, color: 'text-blue-500 hover:border-blue-500/50' },
    { name: 'Twitch', url: 'https://www.twitch.tv', icon: Tv, color: 'text-purple-400 hover:border-purple-400/50' },
    { name: 'SoundCloud', url: 'https://soundcloud.com', icon: Radio, color: 'text-orange-500 hover:border-orange-500/50' },
    { name: 'Vimeo', url: 'https://vimeo.com', icon: Video, color: 'text-teal-400 hover:border-teal-400/50' },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-2.5 mt-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {t('platforms.supported')}
      </span>

      {/* Platform Buttons with direct links */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {platforms.map((p) => {
          const Icon = p.icon;
          return (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${p.color}`}
              title={`Visitar ${p.name}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.name}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
            </a>
          );
        })}

        {/* 1000+ Websites badge with interactive tooltip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('platforms.all')}</span>
          </button>

          {/* Tooltip Card */}
          {showTooltip && (
            <div
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-4 rounded-2xl bg-zinc-900/95 dark:bg-zinc-800/95 text-white backdrop-blur-md border border-zinc-700 shadow-2xl z-40 text-xs animate-fade-in"
            >
              <p className="font-bold mb-1 text-indigo-400">
                {t('platforms.tooltipTitle')}
              </p>
              <p className="text-zinc-300 leading-relaxed text-[11px] mb-2.5">
                {t('platforms.tooltipDesc')}
              </p>
              <a
                href="https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline"
              >
                <span>{t('platforms.viewFullList')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
