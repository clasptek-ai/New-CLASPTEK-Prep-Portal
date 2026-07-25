'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardViewModel } from './hooks/use-dashboard-view-model';
import { DashboardLayout } from './components/dashboard-layout';
import { WidgetManager } from './components/widget-manager';
import { OnboardingState } from '../onboarding/types/onboarding-state';

export function DashboardScreen() {
  const router = useRouter();
  const viewModel = useDashboardViewModel();

  // Automatic Gateway Enforcement: Redirect administrators to admin portal and first-time students to welcome screen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('clasptek_user_role');
      if (role === 'ADMINISTRATOR') {
        router.push('/admin/dashboard');
        return;
      }
      const state = localStorage.getItem('clasptek_onboarding_state');
      if (
        state &&
        state !== OnboardingState.ONBOARDING_COMPLETED &&
        state !== OnboardingState.DIAGNOSTIC_COMPLETED
      ) {
        router.push('/student/welcome');
      }
    }
  }, [router]);

  return (
    <DashboardLayout
      activeProgrammeId={viewModel.activeProgrammeId}
      programmeIds={viewModel.programmeIds}
      onSelectProgramme={viewModel.selectProgramme}
    >
      <WidgetManager viewModel={viewModel} />
    </DashboardLayout>
  );
}

export default DashboardScreen;
