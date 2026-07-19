/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from 'vitest';

process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { NextRequest } from 'next/server';
import { GET as getStudent } from './student/route';
import { GET as getInstructor } from './instructor/route';
import { GET as getAdmin } from './admin/route';
import { GET as getCohorts } from './cohorts/route';
import { GET as getCompetencies } from './competencies/route';
import { GET as getTrends } from './trends/route';
import { GET as getPredictions } from './predictions/route';
import { GET as getEvaluations } from './evaluations/route';
import { GET as getCoach } from './coach/route';
import { GET as getPractice } from './practice/route';
import { GET as getPlatform } from './platform/route';
import { GET as getReports, POST as postReport } from './reports/route';
import { GET as getExports, POST as postExport } from './exports/route';
import { POST as postRefresh } from './refresh/route';

let querySqls: string[] = [];

vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string, _params?: any[]) => {
    querySqls.push(sql);

    if (sql.includes('FROM student_analytics_dashboard_projections')) {
      return {
        rows: [{
          student_id: 'stud-123',
          profile_id: 'prof-456',
          readiness_score: 84.50,
          daily_plan: {},
          goal_completion: 75,
          study_streak: 5,
          last_computed_at: new Date().toISOString()
        }]
      };
    }

    if (sql.includes('FROM instructor_dashboard_projections')) {
      return {
        rows: [{
          cohort_id: 'cohort-123',
          overview: {},
          risk_matrix: {},
          heatmap: {},
          completion_rates: {},
          quality_summary: {},
          predictions_dist: {},
          interventions: {},
          coach_engagement: {},
          top_performers: {},
          attention_needed: {},
          last_computed_at: new Date().toISOString()
        }]
      };
    }

    if (sql.includes('FROM admin_dashboard_projections')) {
      return {
        rows: [{
          org_id: 'org-123',
          platform_usage: {},
          dau: {},
          enrollments: {},
          completion_stats: {},
          ai_usage: {},
          prediction_accuracy: {},
          infrastructure: {},
          revenue: {},
          growth_trends: {},
          retention: {},
          last_computed_at: new Date().toISOString()
        }]
      };
    }

    if (sql.includes('FROM learning_trends')) {
      return {
        rows: [{
          id: 'trend-123',
          category: 'StudyMinutes',
          trend_date: new Date().toISOString(),
          value: '45.0',
          direction: 'UPWARD'
        }]
      };
    }

    if (sql.includes('FROM report_schedules')) {
      return {
        rows: [{
          id: 'sched-1',
          report_definition_id: 'def-1',
          recipient_email: 'test@clasptek.com',
          cron_expression: '0 9 * * 1',
          active: true
        }]
      };
    }

    if (sql.includes('FROM report_definitions')) {
      return {
        rows: [{
          id: 'def-1',
          code: 'WEEKLY_STUDENT_STATUS',
          name: 'Weekly Report',
          template_json: {}
        }]
      };
    }

    return { rows: [] };
  });

  const ClientMock = vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    query: queryMock,
    end: vi.fn(),
    on: vi.fn()
  }));

  const PoolMock = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue({
      query: queryMock,
      release: vi.fn()
    }),
    query: queryMock,
    end: vi.fn(),
    on: vi.fn()
  }));

  return { Client: ClientMock, Pool: PoolMock };
});

describe('Learning Analytics REST API Routes Integration Tests', () => {
  beforeEach(() => {
    querySqls = [];
  });

  test('GET /student returns projection read models', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/student?studentId=stud-123&profileId=prof-456');
    const res = await getStudent(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.studentId).toBe('stud-123');
  });

  test('GET /student validates missing parameters', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/student');
    const res = await getStudent(req);
    expect(res.status).toBe(400);
  });

  test('GET /instructor returns cohort metrics', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/instructor?cohortId=cohort-123');
    const res = await getInstructor(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cohortId).toBe('cohort-123');
  });

  test('GET /admin returns organization details', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/admin?orgId=org-123');
    const res = await getAdmin(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orgId).toBe('org-123');
  });

  test('GET /cohorts calls ports submissions list', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/cohorts?cohortId=cohort-123');
    const res = await getCohorts(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.metrics.submissionsCount).toBe(2);
  });

  test('GET /competencies maps competency averages', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/competencies?competencyCode=COMP-1');
    const res = await getCompetencies(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.competencyCode).toBe('COMP-1');
  });

  test('GET /trends returns timelines', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/trends?category=StudyMinutes');
    const res = await getTrends(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.category).toBe('StudyMinutes');
  });

  test('GET /predictions fetches model accuracy rates', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/predictions?modelVersion=v1.0');
    const res = await getPredictions(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.accuracyRate).toBe(88.5);
  });

  test('GET /evaluations returns override records', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/evaluations');
    const res = await getEvaluations(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.agreementRate).toBe(88.5);
  });

  test('GET /coach returns responses token count analytics', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/coach?coachId=coach-123');
    const res = await getCoach(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalSessions).toBe(14);
  });

  test('GET /practice returns accuracy and durations', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/practice?cohortId=cohort-123');
    const res = await getPractice(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.timeSpentSeconds).toBe(432000);
  });

  test('GET /platform retrieves global active connections', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/platform');
    const res = await getPlatform(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dau).toBe(320);
  });

  test('GET /reports searches active scheduled reports', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/reports');
    const res = await getReports(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThan(0);
  });

  test('POST /reports schedules weekly custom reports', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/reports', {
      method: 'POST',
      body: JSON.stringify({
        reportDefinitionCode: 'WEEKLY_STUDENT_STATUS',
        recipientEmail: 'test@clasptek.com',
        cronExpression: '0 9 * * 1'
      })
    });
    const res = await postReport(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.recipientEmail).toBe('test@clasptek.com');
  });

  test('POST /exports creates csv download task', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/exports', {
      method: 'POST',
      body: JSON.stringify({ format: 'CSV' })
    });
    const res = await postExport(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('COMPLETED');
  });

  test('GET /exports queries downloads status', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/exports?id=export-123');
    const res = await getExports(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('COMPLETED');
  });

  test('POST /refresh updates dashboard projections', async () => {
    const req = new NextRequest('http://localhost/api/v1/analytics/refresh', {
      method: 'POST',
      body: JSON.stringify({ initiatedBy: 'admin', isProduction: false })
    });
    const res = await postRefresh(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('COMPLETED');
  });
});
