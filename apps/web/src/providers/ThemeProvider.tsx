'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_STORAGE_KEY = 'clasptek-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const applyDomTheme = useCallback((mode: ThemeMode) => {
    let active: 'light' | 'dark' = 'light';
    if (mode === 'system') {
      if (typeof window !== 'undefined') {
        active = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    } else {
      active = mode;
    }

    setResolvedTheme(active);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', active);
      root.classList.remove('light', 'dark');
      root.classList.add(active);
    }
  }, []);

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeState(mode);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch {
        // Storage unavailable
      }
      applyDomTheme(mode);
    },
    [applyDomTheme]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  // Initial Theme Hydration
  useEffect(() => {
    try {
      const saved = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'light';
      if (['system', 'light', 'dark'].includes(saved)) {
        setThemeState(saved);
        applyDomTheme(saved);
      } else {
        applyDomTheme('light');
      }
    } catch {
      applyDomTheme('light');
    }

    // Multi-tab storage synchronization listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as ThemeMode;
        if (['system', 'light', 'dark'].includes(newTheme)) {
          setThemeState(newTheme);
          applyDomTheme(newTheme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [applyDomTheme]);

  // Live OS Preference Listener when Mode is 'system'
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const active = e.matches ? 'dark' : 'light';
      setResolvedTheme(active);
      const root = document.documentElement;
      root.setAttribute('data-theme', active);
      root.classList.remove('light', 'dark');
      root.classList.add(active);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
