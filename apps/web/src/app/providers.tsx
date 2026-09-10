'use client';

import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../lib/query-client';
import { ThemeProvider } from '../providers/theme-provider';
import { AuthProvider } from '../providers/AuthProvider';
import { NotificationProvider } from '../providers/notification-provider';
import { ErrorBoundary } from '../components/error/error-boundary';
import { WorkspaceProvider } from '../workspace/WorkspaceProvider';
import { OverlayProvider } from '../shared/ui/overlay/OverlayProvider';
import { ToastContainer } from '../shared/ui/toast/ToastContainer';
import { checkAndInvalidateClientCaches } from '../lib/content-version';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  useEffect(() => {
    checkAndInvalidateClientCaches();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <WorkspaceProvider>
              <OverlayProvider>
                <ErrorBoundary>
                  {children}
                  <ToastContainer toasts={[]} onDismiss={() => {}} />
                </ErrorBoundary>
              </OverlayProvider>
            </WorkspaceProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default Providers;
