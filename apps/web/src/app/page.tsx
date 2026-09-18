'use client';

import React, { useEffect } from 'react';
import {
  LandingHeader,
  LandingHero,
  LandingProgrammes,
  LandingFeatures,
  LandingCTA,
  LandingFooter,
} from '../features/landing';

export default function HomePage() {
  // Production Security Guard: Intercept password recovery / error parameters and forward to /reset-password
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      if (
        search.includes('error') ||
        search.includes('otp_expired') ||
        search.includes('code=') ||
        search.includes('token_hash') ||
        hash.includes('type=recovery') ||
        hash.includes('access_token=')
      ) {
        window.location.href = `/reset-password${search}${hash}`;
      }
    }
  }, []);

  return (
    <div className="bg-(--surface-bg) text-(--text-primary) w-full min-h-screen overflow-x-hidden font-sans">
      {/* 1. Sticky Navigation Header */}
      <LandingHeader />

      <main>
        {/* 2. Hero Section with Trust Pill & Quick Stats */}
        <LandingHero />

        {/* 3. Canonical Programmes Pathways */}
        <LandingProgrammes />

        {/* 4. Enterprise Architecture & Features */}
        <LandingFeatures />

        {/* 5. High-Impact Diagnostic CTA */}
        <LandingCTA />
      </main>

      {/* 6. Enterprise Global Footer */}
      <LandingFooter />
    </div>
  );
}
