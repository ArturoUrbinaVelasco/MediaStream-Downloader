import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Globe,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl z-10 animate-fade-in flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
              {t('about.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/50 dark:border-indigo-900/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-indigo-500/30 shrink-0">
            AU
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
              Arturo Urbina Velasco
            </h3>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {t('about.developerTitle')}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('about.location')}</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 pt-1 leading-relaxed">
              {t('about.bio')}
            </p>
          </div>
        </div>

        {/* Portfolio Link Button */}
        <a
          href="https://arturourbinavelasco.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 hover:bg-zinc-800 transition-all font-semibold text-xs shadow-md shadow-zinc-900/10 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>{t('about.portfolio')}</span>
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-400" />
        </a>

        {/* Direct Contact Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t('about.contact')}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <a
              href="https://wa.me/525559694250?text=Hola%20Arturo,%20vengo%20de%20MediaStream%20Downloader"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors text-xs font-semibold cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp Directo</span>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/Arturo_Urbina_Velasco"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors text-xs font-semibold cursor-pointer"
            >
              <Send className="w-4 h-4 text-sky-500" />
              <span>Telegram Directo</span>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/ArturoUrbinaVelasco"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-semibold cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            {/* Email */}
            <a
              href="mailto:arturo.urbina.velasco@gmail.com"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-semibold truncate cursor-pointer"
            >
              <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">arturo.urbina.velasco</span>
            </a>
          </div>
        </div>

        {/* Security & Architecture Note */}
        <div className="flex items-center gap-2 pt-2 text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Arquitectura limpia, privada y sin retención de datos en servidor.</span>
        </div>
      </div>
    </div>
  );
};
