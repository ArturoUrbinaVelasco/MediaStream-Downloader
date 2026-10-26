import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, CheckCircle, AlertCircle, X } from 'lucide-react';

import { useSettingsStore } from './store/useSettingsStore';
import { useHistoryStore } from './store/useHistoryStore';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { PlatformBadges } from './components/PlatformBadges';
import { MediaCard } from './components/MediaCard';
import { ProgressBar } from './components/ProgressBar';
import { HistoryDrawer } from './components/HistoryDrawer';

import type {
  MediaMetadata,
  FormatPreset,
  ProgressEventPayload,
} from './types';
import {
  extractMetadata,
  startDownload,
  subscribeToTaskProgress,
  getFileDownloadUrl,
  checkHealth,
} from './services/api';
import type { HealthCheckResult } from './services/api';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { applyTheme } = useSettingsStore();
  const { addItem } = useHistoryStore();

  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeProgress, setActiveProgress] = useState<ProgressEventPayload | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Initialize theme on mount and watch system changes
  useEffect(() => {
    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme]);

  // Periodic health check
  useEffect(() => {
    const verifyHealth = async () => {
      try {
        const result = await checkHealth();
        setHealthStatus(result);
        setServerOnline(true);
      } catch {
        setServerOnline(false);
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleInspect = async (url: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveProgress(null);
    setDownloadUrl(undefined);

    try {
      const data = await extractMetadata(url);
      setMetadata(data);
    } catch (err: any) {
      setErrorMessage(err.message || t('input.invalidUrl'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFormat = async (preset: FormatPreset, customFormatId?: string) => {
    if (!metadata) return;
    setErrorMessage(null);

    try {
      const { task_id } = await startDownload(metadata.url, preset, customFormatId);

      setActiveProgress({
        task_id,
        status: 'starting',
        percent: 0,
      });

      // Subscribe to live SSE events
      const unsubscribe = subscribeToTaskProgress(
        task_id,
        (event) => {
          setActiveProgress(event);

          if (event.status === 'finished') {
            const finalUrl = getFileDownloadUrl(task_id, event.filename);
            setDownloadUrl(finalUrl);

            // Record into local history store
            addItem({
              id: task_id,
              url: metadata.url,
              title: metadata.title,
              uploader: metadata.uploader,
              thumbnail: metadata.thumbnail,
              duration: metadata.duration,
              platform: metadata.platform,
              preset,
              filename: event.filename || `${metadata.title}.mp4`,
              timestamp: Date.now(),
            });

            // Automatically trigger download in browser
            const anchor = document.createElement('a');
            anchor.href = finalUrl;
            anchor.setAttribute('download', event.filename || 'media');
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
          }
        },
        () => {
          // Fallback if SSE is interrupted
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      setErrorMessage(err.message || t('progress.error'));
      setActiveProgress(null);
    }
  };

  const handleReset = () => {
    setMetadata(null);
    setErrorMessage(null);
    setActiveProgress(null);
    setDownloadUrl(undefined);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center gap-8">
        {/* Hero Section */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ultra-fast 1-Click Downloader</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            {t('appName')}
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal">
            {t('tagline')}
          </p>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="w-full max-w-2xl mx-auto flex items-start justify-between gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-sm shadow-sm animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-semibold">Aviso</p>
                <p className="text-xs opacity-90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <UrlInput onInspect={handleInspect} isLoading={isLoading} />

        {/* Dynamic Display Area */}
        {activeProgress ? (
          <ProgressBar
            progress={activeProgress}
            downloadUrl={downloadUrl}
            onReset={handleReset}
          />
        ) : metadata ? (
          <MediaCard
            metadata={metadata}
            onSelectFormat={handleSelectFormat}
            isDownloading={isLoading}
          />
        ) : (
          <PlatformBadges />
        )}
      </main>

      {/* Bottom Status & Footer */}
      <footer className="w-full py-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                serverOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>
              {serverOnline
                ? `${t('status.serverConnected')} (v${healthStatus?.version || '1.0.0'})`
                : t('status.serverDisconnected')}
            </span>
            {healthStatus?.ffmpeg_available && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                <CheckCircle className="w-3 h-3" /> FFmpeg
              </span>
            )}
          </div>
          <div>MediaStream Downloader &copy; 2026 &bull; Cross-Platform Mobile & Web</div>
        </div>
      </footer>

      {/* History Slide-over */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectUrl={(url) => {
          handleInspect(url);
        }}
      />
    </div>
  );
};

export default App;
