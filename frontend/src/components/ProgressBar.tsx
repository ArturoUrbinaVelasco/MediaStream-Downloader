import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, CheckCircle2, AlertCircle, RefreshCw, Loader2, Gauge, Timer } from 'lucide-react';
import type { ProgressEventPayload } from '../types';

interface ProgressBarProps {
  progress: ProgressEventPayload;
  downloadUrl?: string;
  onReset: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  downloadUrl,
  onReset,
}) => {
  const { t } = useTranslation();

  const isFinished = progress.status === 'finished';
  const isError = progress.status === 'error';
  const isProcessing = progress.status === 'processing';

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl shadow-indigo-500/10 flex flex-col gap-5 animate-fade-in">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isFinished ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          ) : isError ? (
            <AlertCircle className="w-6 h-6 text-rose-500" />
          ) : isProcessing ? (
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          ) : (
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          )}

          <div>
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 leading-tight">
              {t(`progress.${progress.status}`, { defaultValue: progress.status })}
            </h3>
            {progress.filename && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs sm:max-w-md">
                {progress.filename}
              </p>
            )}
          </div>
        </div>

        {/* Percentage badge */}
        {!isError && (
          <span className="font-mono font-bold text-base sm:text-lg text-indigo-600 dark:text-indigo-400">
            {progress.percent.toFixed(0)}%
          </span>
        )}
      </div>

      {/* Progress Track */}
      {!isError && (
        <div className="relative w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isFinished
                ? 'bg-emerald-500'
                : isProcessing
                ? 'bg-amber-500 animate-pulse'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(2, progress.percent))}%` }}
          />
        </div>
      )}

      {/* Live Metrics (Speed and ETA) */}
      {progress.status === 'downloading' && (
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium px-1">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-indigo-500" />
            <span>{progress.speed || '0 KB/s'}</span>
          </div>
          {progress.eta !== undefined && progress.eta !== null && (
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-purple-500" />
              <span>
                {t('progress.eta')}: {progress.eta}s
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-300">
          <p className="font-semibold mb-1">{t('progress.error')}</p>
          <p className="opacity-90">{progress.error || 'Unknown error occurred during download.'}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        {isFinished && downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>{t('progress.downloadFile')}</span>
          </a>
        )}

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-sm transition-all cursor-pointer active:scale-98"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('progress.newDownload')}</span>
        </button>
      </div>
    </div>
  );
};
