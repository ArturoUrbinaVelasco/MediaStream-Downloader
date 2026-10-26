import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Trash2, RotateCcw, Clock } from 'lucide-react';
import { useHistoryStore } from '../store/useHistoryStore';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl: (url: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectUrl,
}) => {
  const { t } = useTranslation();
  const { items, clearHistory, removeItem } = useHistoryStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-5 flex flex-col shadow-2xl z-10 animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-base text-zinc-900 dark:text-white">
              {t('history.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 dark:text-zinc-500">
              <Clock className="w-12 h-12 mb-3 stroke-1 opacity-40" />
              <p className="text-sm font-medium">{t('history.empty')}</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group relative flex gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-indigo-400/50 transition-all"
              >
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-lg bg-zinc-700 overflow-hidden shrink-0">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                      Media
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {item.uploader}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {item.preset}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onSelectUrl(item.url);
                      onClose();
                    }}
                    title={t('history.downloadAgain')}
                    className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => {
                if (window.confirm(t('history.confirmClear'))) {
                  clearHistory();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('history.clearAll')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
