import { describe, test, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/instructor/dashboard',
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn()
    }),
    use: (promise: any) => {
      // Basic mock of React.use for params promise
      return { studentId: 's2', cohortId: 'c1', assessmentId: 'a1' };
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

import { instructorNavigation } from '../navigation/instructor.navigation';
import { InstructorDashboardScreen } from '../features/instructor/dashboard/dashboard-screen';
import { StudentsScreen } from '../features/instructor/students/students-screen';
import { CohortsScreen } from '../features/instructor/cohorts/cohorts-screen';
import { AssessmentsScreen } from '../features/instructor/assessments/assessments-screen';
import { EvaluationScreen } from '../features/instructor/evaluation/evaluation-screen';
import { InterventionsScreen } from '../features/instructor/interventions/interventions-screen';
import { CommunicationScreen } from '../features/instructor/communication/communication-screen';
import { CalendarScreen } from '../features/instructor/calendar/calendar-screen';
import { ReportsScreen } from '../features/instructor/reports/reports-screen';

describe('Instructor Workspace Integration tests', () => {
  test('Verify all instructor feature modules compile', () => {
    expect(instructorNavigation.length).toBeGreaterThan(5);
    expect(InstructorDashboardScreen).toBeDefined();
    expect(StudentsScreen).toBeDefined();
    expect(CohortsScreen).toBeDefined();
    expect(AssessmentsScreen).toBeDefined();
    expect(EvaluationScreen).toBeDefined();
    expect(InterventionsScreen).toBeDefined();
    expect(CommunicationScreen).toBeDefined();
    expect(CalendarScreen).toBeDefined();
    expect(ReportsScreen).toBeDefined();
  });
});
