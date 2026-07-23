import { jsx as _jsx } from 'react/jsx-runtime';
import { createContext, useContext, useEffect, useState } from 'react';
export const ThemeStorage = {
  KEY: 'cds-user-theme-preference',
  get() {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem(this.KEY) || 'dark';
  },
  set(theme) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEY, theme);
    }
  },
};
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children, defaultTheme = 'dark' }) => {
  const [theme, setThemeState] = useState(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  useEffect(() => {
    const saved = ThemeStorage.get();
    setThemeState(saved);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    let computedMode = 'dark';
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
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    ThemeStorage.set(newTheme);
  };
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  return _jsx(ThemeContext.Provider, {
    value: { theme, resolvedTheme, setTheme, toggleTheme },
    children: children,
  });
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
