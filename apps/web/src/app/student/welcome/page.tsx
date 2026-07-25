'use client';

import React from 'react';
import { WelcomeGatewayScreen } from '@/features/onboarding/screens/welcome-gateway-screen';

export default function StudentWelcomePage() {
  // Read stored onboarding data from localStorage if present
  let onboardingData = undefined;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('clasptek_onboarding_data');
      if (raw) {
        onboardingData = JSON.parse(raw);
      }
    } catch {
      // Fall back to default
    }
  }

  return <WelcomeGatewayScreen onboardingData={onboardingData} />;
}
