import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Sun, Moon, Monitor, Clock, Globe } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { ThemeMode } from '../store/useSettingsStore';
import { useHistoryStore } from '../store/useHistoryStore';

interface HeaderProps {
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory }) => {
  const { t } = useTranslation();
  const { language, setLanguage, theme, setTheme } = useSettingsStore();
  const historyItems = useHistoryStore((state) => state.items);

  const cycleTheme = () => {
    const sequence: ThemeMode[] = ['system', 'light', 'dark'];
    const nextIndex = (sequence.indexOf(theme) + 1) % sequence.length;
    setTheme(sequence[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'dark':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      default:
        return <Monitor className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
              MediaStream
            </h1>
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
              Downloader Pro
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all active:scale-95 cursor-pointer"
            title="Cambiar idioma / Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all active:scale-95 cursor-pointer"
            title={`Tema: ${t(`theme.${theme}`)}`}
          >
            {getThemeIcon()}
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all active:scale-95 cursor-pointer"
            title={t('history.title')}
          >
            <Clock className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            {historyItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {historyItems.length > 9 ? '9+' : historyItems.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
