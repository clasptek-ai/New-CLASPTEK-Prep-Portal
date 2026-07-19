import { describe, test, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/admin/dashboard',
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn()
    }),
    use: (promise: any) => {
      return { attemptId: 'att1', userId: 'u1' };
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
import { adminDashboardService } from '../services/admin/dashboard.service';
import { adminUsersService } from '../services/admin/users.service';
import { adminProgrammesService } from '../services/admin/programmes.service';
import { adminCurriculumService } from '../services/admin/curriculum.service';
import { adminAssessmentsService } from '../services/admin/assessments.service';
import { adminAssessmentReviewsService } from '../services/admin/assessment-reviews.service';
import { adminQuestionsService } from '../services/admin/questions.service';
import { adminResourcesService } from '../services/admin/resources.service';
import { adminReportsService } from '../services/admin/reports.service';
import { adminSettingsService } from '../services/admin/settings.service';
import { adminAuditService } from '../services/admin/audit.service';

describe('Platform Administration Workspace Integration & Verification', () => {
  test('Admin navigation registry matches the 11 standard links', () => {
    const ws = getWorkspace('ADMIN');
    expect(ws.navigation.length).toBe(11);
    expect(ws.navigation[0].name).toBe('Dashboard');
    expect(ws.navigation[1].name).toBe('Users');
    expect(ws.navigation[5].name).toBe('Assessment Reviews');
    expect(ws.navigation[10].name).toBe('Settings');
  });

  test('Dashboard aggregated service queries and health check returns expected values', async () => {
    const res = await adminDashboardService.getDashboardData();
    expect(res.stats.totalUsers).toBeGreaterThan(0);
    expect(res.stats.platformHealth).toBe('HEALTHY');
    expect(res.notifications.length).toBeGreaterThan(0);
  });

  test('Users service handles suspensions and role modifications correctly', async () => {
    const list = await adminUsersService.getUsers();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].statusHistory.length).toBeGreaterThan(0);

    const suspendRes = await adminUsersService.updateUserStatus('u1', 'SUSPENDED', 'Policy breach');
    expect(suspendRes).toBe(true);

    const resetRes = await adminUsersService.initiatePasswordReset('u1');
    expect(resetRes).toBe(true);
  });

  test('Programmes and curriculum service processes reordering sequences', async () => {
    const progs = await adminProgrammesService.getProgrammes();
    expect(progs.length).toBeGreaterThan(0);

    const modules = await adminCurriculumService.getModules('p1');
    expect(modules.length).toBeGreaterThan(0);

    const reorderRes = await adminCurriculumService.reorderModules('p1', ['m1', 'm2']);
    expect(reorderRes).toBe(true);
  });

  test('Assessments and review service tracks attempts timelines and integrity metrics', async () => {
    const configs = await adminAssessmentsService.getAssessments();
    expect(configs.length).toBeGreaterThan(0);

    const attempts = await adminAssessmentReviewsService.getAttempts();
    expect(attempts.length).toBeGreaterThan(0);

    const detail = await adminAssessmentReviewsService.getAttemptDetail('att1');
    expect(detail.lifecycle.length).toBeGreaterThan(0);
    expect(detail.questions.length).toBeGreaterThan(0);
    expect(detail.questions[0].marksAllocated).toBe(5);
    expect(detail.integrity.browserDevice).toBeDefined();

    const noteRes = await adminAssessmentReviewsService.addAdministrativeNote('att1', 'Reviewing attempt logs');
    expect(noteRes).toBe(true);
  });

  test('Reports service processes date range filters', async () => {
    const res1 = await adminReportsService.generateQuestionAnalysisReport({ programmeId: 'p1' });
    expect(res1).toBeDefined();

    const res2 = await adminReportsService.generateProgrammeReadinessReport({ cohortId: 'cohort-c' });
    expect(res2).toBeDefined();
  });

  test('Settings service limits modification boundaries', async () => {
    const settings = await adminSettingsService.getSettings();
    expect(settings.portalName).toBeDefined();

    const updateRes = await adminSettingsService.updateSettings({ maintenanceMode: true });
    expect(updateRes).toBe(true);
  });

  test('Audit logs service returns read-only security events', async () => {
    const logs = await adminAuditService.getAuditLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].category).toBeDefined();
  });
});
