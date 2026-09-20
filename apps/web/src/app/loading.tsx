import React from 'react';
import { ClasptekLoadingScreen } from '@/components/feedback/ClasptekLoadingScreen';

/**
 * Root loading screen — shown by Next.js Suspense while
 * the root route and layout data are being fetched.
 */
export default function RootLoading() {
  return <ClasptekLoadingScreen context="workspace" message="Loading your workspace…" />;
}
