import { describe, test, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/authoring/dashboard',
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn()
    }),
    use: (promise: any) => {
      return { programmeId: 'p1', questionId: 'q1' };
    }
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

import { AcademicStudioLayout } from '../layouts/academic-layout';
import { authoringNavigation } from '../navigation/authoring.navigation';
import { AuthoringDashboardScreen } from '../features/authoring/dashboard/dashboard-screen';
import { DraftsScreen } from '../features/authoring/drafts/drafts-screen';
import { ProgrammesScreen } from '../features/authoring/programmes/programmes-screen';
import { QuestionBankScreen } from '../features/authoring/question-bank/question-bank-screen';
import { CurriculumScreen } from '../features/authoring/curriculum/curriculum-screen';
import { ReviewsScreen } from '../features/authoring/reviews/reviews-screen';
import { PublishingScreen } from '../features/authoring/publishing/publishing-screen';
import { AuditScreen } from '../features/authoring/audit/audit-screen';

describe('Academic Authoring Studio Integration tests', () => {
  test('Verify all authoring feature modules and layout definitions compile', () => {
    expect(AcademicStudioLayout).toBeDefined();
    expect(authoringNavigation.length).toBeGreaterThan(5);
    expect(AuthoringDashboardScreen).toBeDefined();
    expect(DraftsScreen).toBeDefined();
    expect(ProgrammesScreen).toBeDefined();
    expect(QuestionBankScreen).toBeDefined();
    expect(CurriculumScreen).toBeDefined();
    expect(ReviewsScreen).toBeDefined();
    expect(PublishingScreen).toBeDefined();
    expect(AuditScreen).toBeDefined();
  });
});

import { GlobalAssetRegistry } from '../components/authoring/global-asset-registry';
import { SavedViewsPanel } from '../components/authoring/saved-views-panel';
import { ReviewCommentsPanel } from '../components/authoring/review-comments-panel';
import { ValidationSummary } from '../components/authoring/validation-summary';
import { PublishingCalendar } from '../components/authoring/publishing-calendar';

describe('Shared Authoring Enhancements Component compile validation', () => {
  test('Enhancements components stubs are defined and compile cleanly', () => {
    expect(GlobalAssetRegistry).toBeDefined();
    expect(SavedViewsPanel).toBeDefined();
    expect(ReviewCommentsPanel).toBeDefined();
    expect(ValidationSummary).toBeDefined();
    expect(PublishingCalendar).toBeDefined();
  });
});
