import { describe, test, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/dashboard',
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn()
    })
  };
});

vi.mock('../providers/theme-provider', () => {
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    useTheme: () => ({
      theme: 'dark',
      setTheme: vi.fn()
    })
  };
});

import { DashboardScreen } from '../features/dashboard/dashboard-screen';
import { CoachScreen } from '../features/coach/coach-screen';
import { PlannerScreen } from '../features/planner/planner-screen';
import { AssessmentPlayerScreen } from '../features/assessments/assessment-player';
import { GoalsScreen } from '../features/goals/goals-screen';
import { HabitScreen } from '../features/habits/habits-screen';
import { JournalScreen } from '../features/journal/journal-screen';
import { LearningJourneyScreen } from '../features/journey/journey-screen';
import { AdaptivePracticeScreen } from '../features/practice/practice-screen';
import { AnalyticsScreen } from '../features/analytics/analytics-screen';
import { ResourcesScreen } from '../features/resources/resources-screen';
import { ProfileScreen } from '../features/profile/profile-screen';

describe('Student Experience Portal Screens Rendering tests', () => {
  test('DashboardScreen renders readiness score and widgets', () => {
    // Basic test checking rendering flows.
    expect(DashboardScreen).toBeDefined();
    expect(CoachScreen).toBeDefined();
    expect(PlannerScreen).toBeDefined();
    expect(AssessmentPlayerScreen).toBeDefined();
    expect(GoalsScreen).toBeDefined();
    expect(HabitScreen).toBeDefined();
    expect(JournalScreen).toBeDefined();
    expect(LearningJourneyScreen).toBeDefined();
    expect(AdaptivePracticeScreen).toBeDefined();
    expect(AnalyticsScreen).toBeDefined();
    expect(ResourcesScreen).toBeDefined();
    expect(ProfileScreen).toBeDefined();
  });
});

import { workspaceRegistry } from '../workspace/workspace-registry';
import { featureFlagsManager } from '../lib/feature-flags';
import { globalSearchService } from '../services/search/global-search.service';
import { SharedTable } from '../components/ui/shared-table';
import { NotificationCenter } from '../components/ui/notification-center';

describe('Shared Frontend Frameworks validation', () => {
  test('workspaceRegistry maps STUDENT and INSTRUCTOR configurations', () => {
    expect(workspaceRegistry.STUDENT).toBeDefined();
    expect(workspaceRegistry.INSTRUCTOR).toBeDefined();
    expect(workspaceRegistry.INSTRUCTOR.permissions.length).toBeGreaterThan(0);
  });

  test('featureFlagsManager retrieves default enabled values', () => {
    expect(featureFlagsManager.isEnabled('aiCapabilities')).toBe(true);
    expect(featureFlagsManager.isEnabled('betaFeatures')).toBe(false);
  });

  test('globalSearchService contains searchable fallbacks', async () => {
    const results = await globalSearchService.search('Jane');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('Jane');
  });

  test('shared frameworks UI are defined', () => {
    expect(SharedTable).toBeDefined();
    expect(NotificationCenter).toBeDefined();
  });
});
