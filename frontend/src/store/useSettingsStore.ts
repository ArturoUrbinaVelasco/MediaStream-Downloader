import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  language: 'es' | 'en';
  theme: ThemeMode;
  setLanguage: (lang: 'es' | 'en') => void;
  setTheme: (theme: ThemeMode) => void;
  applyTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: (localStorage.getItem('mediastream_language') as 'es' | 'en') || 'es',
      theme: 'system',

      setLanguage: (lang: 'es' | 'en') => {
        i18n.changeLanguage(lang);
        localStorage.setItem('mediastream_language', lang);
        set({ language: lang });
      },

      setTheme: (theme: ThemeMode) => {
        set({ theme });
        get().applyTheme();
      },

      applyTheme: () => {
        const { theme } = get();
        const root = document.documentElement;
        const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;

        if (effectiveTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },
    }),
    {
      name: 'mediastream_settings',
    }
  )
);
