import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, Clipboard, X, Search, Loader2 } from 'lucide-react';

interface UrlInputProps {
  onInspect: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onInspect, isLoading }) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
        // Automatically inspect after paste for 1-click UX
        onInspect(text.trim());
      }
    } catch {
      setError(t('input.clipboardError'));
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl || !cleanUrl.startsWith('http')) {
      setError(t('input.invalidUrl'));
      return;
    }
    setError(null);
    onInspect(cleanUrl);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
        <div className="relative flex items-center shadow-lg shadow-indigo-500/5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-all p-1.5">
          {/* Left Icon */}
          <div className="pl-3 pr-2 text-zinc-400 dark:text-zinc-500">
            <Link2 className="w-5 h-5" />
          </div>

          {/* Input field */}
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t('input.placeholder')}
            className="w-full py-3 px-1 text-sm sm:text-base bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden"
            disabled={isLoading}
            autoFocus
          />

          {/* Clear button if text is present */}
          {url && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Paste button (visible when empty) */}
          {!url && !isLoading && (
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors mr-1 cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>{t('input.pasteButton')}</span>
            </button>
          )}

          {/* Submit action button */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">{t('input.inspecting')}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">{t('input.inspectButton')}</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-rose-500 dark:text-rose-400 pl-3 font-medium animate-fade-in">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};
