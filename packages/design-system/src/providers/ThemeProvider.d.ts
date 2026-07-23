import React from 'react';
export type ThemeMode = 'light' | 'dark' | 'system';
export interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}
export declare const ThemeStorage: {
  KEY: string;
  get(): ThemeMode;
  set(theme: ThemeMode): void;
};
export declare const ThemeProvider: React.FC<{
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}>;
export declare const useTheme: () => ThemeContextType;
