'use client';

import React from 'react';
import { ErrorBoundaryProvider } from './ErrorBoundaryProvider';
import { NotificationProvider } from './NotificationProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryProvider>
      <NotificationProvider>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </NotificationProvider>
    </ErrorBoundaryProvider>
  );
}
