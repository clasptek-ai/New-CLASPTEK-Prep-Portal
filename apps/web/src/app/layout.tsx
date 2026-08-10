import './globals.css';
import React from 'react';
import { Providers } from './providers';
import type { Metadata, Viewport } from 'next';
import { BrandConfig } from '@/config/brand.config';
import { Inter } from 'next/font/google';
import { SkeletonStyles } from '@/components/ui/skeleton';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#0b0f19',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://portal.clasptek.org'
  ),
  title: `${BrandConfig.portalName} — Enterprise Academic Workspace`,
  description:
    'AI-powered adaptive learning, mock examination runtime, and exam readiness analytics platform.',
  icons: {
    icon: BrandConfig.logoUrl,
    apple: BrandConfig.logoUrl,
  },
  manifest: '/manifest.json',
  openGraph: {
    title: BrandConfig.portalName,
    description:
      'Empowering global candidates with adaptive learning technology and AI-driven assessments.',
    images: [{ url: BrandConfig.logoUrl }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: BrandConfig.portalName,
    description: 'AI-powered diagnostic mocks and readiness predictions.',
    images: [BrandConfig.logoUrl],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <SkeletonStyles />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
