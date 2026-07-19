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
      return { studentId: 's2' };
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

import { getWorkspace } from '../workspace/workspace-registry';
import { instructorStudentsService } from '../services/instructor/students.service';
import { instructorAssignmentsService } from '../services/instructor/assignments.service';
import { instructorSubmissionsService } from '../services/instructor/submissions.service';
import { instructorDashboardService } from '../services/instructor/dashboard.service';
import { instructorMockResultsService } from '../services/instructor/mock-results.service';
import { StudentsScreen } from '../features/instructor/students/students-screen';
import { InstructorDashboardScreen } from '../features/instructor/dashboard/dashboard-screen';
import { InstructorProgrammesScreen } from '../features/instructor/programmes/programmes-screen';

describe('Instructor Workspace Integration & Authorization Tests', () => {
  test('Sidebar navigation maps the 11 required links exactly', () => {
    const ws = getWorkspace('INSTRUCTOR');
    expect(ws.navigation.length).toBe(11);
    expect(ws.navigation[0].name).toBe('Dashboard');
    expect(ws.navigation[1].name).toBe('My Programmes');
    expect(ws.navigation[2].name).toBe('My Students');
    expect(ws.navigation[9].name).toBe('Instructor Notes');
  });

  test('Enforces strict instructor student scoping access', async () => {
    // Instructor A tries to access s2 (Jane Smith)
    const list = await instructorStudentsService.getStudents();
    const canAccess = list.some(s => s.id === 's2');
    expect(canAccess).toBe(true);

    // Instructor tries to query a student outside their directory list
    const unassignedExists = list.some(s => s.id === 's_unknown');
    expect(unassignedExists).toBe(false);
  });

  test('Assignment transitions Draft to Published status successfully', async () => {
    const success = await instructorAssignmentsService.updateAssignmentStatus('a2', 'PUBLISHED');
    expect(success).toBe(true);
  });

  test('Grading submissions and feedback overrides save correctly', async () => {
    const success = await instructorSubmissionsService.gradeSubmission('sub1', 95, 'Well structured modifiers coherence.');
    expect(success).toBe(true);
  });

  test('Dashboard aggregated service queries and stats metrics are populated', async () => {
    const data = await instructorDashboardService.getDashboardData();
    expect(data.stats.avgReadiness).toBe(73.5);
    expect(data.recentActivity.length).toBeGreaterThan(0);
    expect(data.notifications.length).toBeGreaterThan(0);
  });

  test('Mock exam results diagnostics resolve metrics successfully', async () => {
    const data = await instructorMockResultsService.getMockResults();
    expect(data[0].score).toBe(82);
    expect(data[0].incorrectQuestions).toContain(24);
  });
});
