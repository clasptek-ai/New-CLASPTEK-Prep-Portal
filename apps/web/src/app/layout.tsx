import './globals.css';
import React from 'react';
import { ThemeProvider } from '../providers/theme-provider';
import { NotificationProvider } from '../providers/notification-provider';
import { ErrorBoundary } from '../components/error/error-boundary';
import { WorkspaceProvider } from '../workspace/WorkspaceProvider';

export const metadata = {
  title: 'Clasptek Prep Portal V2 — Enterprise Academic Workspace',
  description: 'AI-powered adaptive learning, mock examination runtime, and exam readiness analytics platform.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Clasptek Prep Portal V2',
    description: 'Empowering global candidates with adaptive learning technology and AI-driven assessments.',
    images: [{ url: '/logo.png' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clasptek Prep Portal V2',
    description: 'AI-powered diagnostic mocks and readiness predictions.',
    images: ['/logo.png'],
  },
  themeColor: '#283471',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <NotificationProvider>
            <WorkspaceProvider>
              <ErrorBoundary>
                <div className="shell-container">{children}</div>
              </ErrorBoundary>
            </WorkspaceProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
