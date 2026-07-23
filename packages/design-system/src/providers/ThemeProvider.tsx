import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeStorage = {
  KEY: 'cds-user-theme-preference',
  get(): ThemeMode {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem(this.KEY) as ThemeMode) || 'dark';
  },
  set(theme: ThemeMode): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEY, theme);
    }
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultTheme?: ThemeMode }> = ({
  children,
  defaultTheme = 'dark',
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const saved = ThemeStorage.get();
    setThemeState(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let computedMode: 'light' | 'dark' = 'dark';

    if (theme === 'system') {
      computedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      computedMode = theme;
    }

    setResolvedTheme(computedMode);
    root.classList.remove('light', 'dark');
    root.classList.add(computedMode);
    root.setAttribute('data-theme', computedMode);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    ThemeStorage.set(newTheme);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
