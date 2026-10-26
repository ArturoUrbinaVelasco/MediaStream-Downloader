import React from 'react';
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
} from 'lucide-react';

export const PlatformBadges: React.FC = () => {
  const { t } = useTranslation();

  const platforms = [
    { name: 'YouTube', icon: Play, color: 'text-red-500' },
    { name: 'TikTok', icon: Music, color: 'text-cyan-400' },
    { name: 'Instagram', icon: Camera, color: 'text-pink-500' },
    { name: 'X / Twitter', icon: Share2, color: 'text-sky-400' },
    { name: 'Facebook', icon: PlaySquare, color: 'text-blue-500' },
    { name: 'Twitch', icon: Tv, color: 'text-purple-400' },
    { name: 'SoundCloud', icon: Radio, color: 'text-orange-500' },
    { name: 'Vimeo', icon: Video, color: 'text-teal-400' },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-2 mt-6">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {t('platforms.supported')}
      </span>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {platforms.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.name}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 shadow-xs"
            >
              <Icon className={`w-3.5 h-3.5 ${p.color}`} />
              <span>{p.name}</span>
            </div>
          );
        })}
        <div className="flex items-center px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 font-normal">
          {t('platforms.all')}
        </div>
      </div>
    </div>
  );
};
