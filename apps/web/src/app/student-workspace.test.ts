import { describe, test, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/dashboard',
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn(),
    }),
    use: (promise: any) => {
      return { studentId: 'stud-active-123' };
    },
  };
});

vi.mock('../providers/theme-provider', () => {
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    useTheme: () => ({
      theme: 'dark',
      setTheme: vi.fn(),
    }),
  };
});

import { getWorkspace } from '../workspace/workspace-registry';
import { studentDashboardService } from '../services/student/dashboard.service';
import { studentLearningService } from '../services/student/learning.service';
import { studentPracticeService } from '../services/student/practice.service';
import { studentAssignmentsService } from '../services/student/assignments.service';
import { studentMockExamsService } from '../services/student/mock-exams.service';
import { studentReadinessService } from '../services/student/readiness.service';
import { studentProfileService } from '../services/student/profile.service';

describe('Student Workspace Integration & Services Verification', () => {
  test('Student Sidebar configuration contains required navigation routes', () => {
    const ws = getWorkspace('STUDENT');
    expect(ws.navigation.length).toBeGreaterThanOrEqual(7);
    expect(ws.navigation[0].name).toBe('Dashboard');
    expect(ws.navigation[1].name).toBe('Learning');
    expect(ws.navigation[2].name).toBe('Practice');
  });

  test('Student Dashboard aggregated data returns correct stats and activities', async () => {
    const data = await studentDashboardService.getDashboardData();
    expect(data.stats.learningProgress).toBe(62);
    expect(data.stats.practiceAccuracy).toBe(78);
    expect(data.stats.readinessScore).toBeGreaterThan(0);
    expect(data.recommendations.length).toBeGreaterThan(0);
    expect(data.upcomingDeadlines.length).toBeGreaterThan(0);
  });

  test('Learning service retrieves enrolled programmes modules and lessons', async () => {
    const data = await studentLearningService.getEnrolledProgrammes();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].modules.length).toBeGreaterThan(0);
    expect(data[0].modules[0].lessons[0].status).toBe('COMPLETED');
  });

  test('Adaptive Practice service starts session and submits answers correctly', async () => {
    const stats = await studentPracticeService.getPracticeStats();
    expect(stats.accuracy).toBe(74);
    expect(stats.weakTopics).toContain('Relative Clauses Syntax');

    const question = await studentPracticeService.startPractice('ADAPTIVE');
    expect(question.options.length).toBe(4);

    const submitRes = await studentPracticeService.submitAnswer(question.id, question.answer);
    expect(submitRes.correct).toBe(true);
  });

  test('Assignments service processes submissions and views grades/AI diagnostics', async () => {
    const list = await studentAssignmentsService.getAssignments();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].grade).toBe(85);
    expect(list[0].aiEvaluation?.grammarScore).toBe(82);

    const submitRes = await studentAssignmentsService.submitAssignment(
      'as2',
      'https://supabase.co/doc.pdf'
    );
    expect(submitRes).toBe(true);
  });

  test('Mock Exams service queries mock history and starts test sessions', async () => {
    const list = await studentMockExamsService.getMockExams();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].status).toBe('COMPLETED');
    expect(list[0].incorrectQuestions).toContain(24);

    const startRes = await studentMockExamsService.startExamSession('exam2');
    expect(startRes.success).toBe(true);
  });

  test('Readiness service fetches current score prediction metrics', async () => {
    const data = await studentReadinessService.getReadiness();
    expect(data.overallReadiness).toBe(76);
    expect(data.targetScore).toBe(85);
    expect(data.riskLevel).toBe('LOW');
  });

  test('Profile service manages user personal info updates and password reset dispatching', async () => {
    const data = await studentProfileService.getProfile();
    expect(data.name).toBeDefined();
    expect(data.loginHistory.length).toBeGreaterThan(0);

    const passRes = await studentProfileService.changePassword();
    expect(passRes).toBe(true);
  });
});
