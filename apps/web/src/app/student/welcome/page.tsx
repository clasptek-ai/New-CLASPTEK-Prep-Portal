'use client';

import React, { useState, useEffect } from 'react';
import { WelcomeGatewayScreen } from '@/features/onboarding/screens/welcome-gateway-screen';

export default function StudentWelcomePage() {
  const [onboardingData, setOnboardingData] = useState<any>({
    firstName: 'Student',
    targetExam: 'IELTS Academic',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        let name = localStorage.getItem('clasptek_user_name');
        if (!name) {
          const profileRaw = localStorage.getItem('clasptek_user_profile');
          if (profileRaw) {
            const parsedProfile = JSON.parse(profileRaw);
            name = parsedProfile.name || parsedProfile.firstName;
          }
        }

        const rawData = localStorage.getItem('clasptek_onboarding_data');
        let data: any = {};
        if (rawData) {
          data = JSON.parse(rawData);
        }

        setOnboardingData({
          firstName: data.firstName || name || 'Candidate',
          targetExam: data.targetExam || 'IELTS Academic',
          previousScore: data.previousScore || '6.5',
          targetScore: data.targetScore || '8.0 Band',
          plannedExamDate: data.plannedExamDate || '2026-09-15',
          purpose: data.purpose || 'Study Abroad',
          baselineLevel: data.baselineLevel || 'Intermediate',
          ...data,
        });
      } catch (e) {
        console.error('Error loading welcome gateway data', e);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  return <WelcomeGatewayScreen onboardingData={onboardingData} />;
}
