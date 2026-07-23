import './globals.css';
import React from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'Clasptek Prep Portal V2 — Enterprise Academic Workspace',
  description:
    'AI-powered adaptive learning, mock examination runtime, and exam readiness analytics platform.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Clasptek Prep Portal V2',
    description:
      'Empowering global candidates with adaptive learning technology and AI-driven assessments.',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
