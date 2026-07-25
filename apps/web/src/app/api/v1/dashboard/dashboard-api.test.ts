import { describe, test, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getOverview } from './route';
import { GET as getActivity } from './activity/route';
import { GET as getCalendar } from './calendar/route';
import { GET as getAchievements } from './achievements/route';

vi.mock('@/lib/auth-util', () => ({
  getAuthenticatedSession: async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');
    if (authHeader === 'Bearer mock-unauthorized') return null;
    if (authHeader === 'Bearer mock-forbidden-student') {
      return { userId: 'stud-user-789', roles: ['STUDENT'] };
    }
    return { userId: 'stud-active-123', roles: ['STUDENT'] };
  },
}));

describe('Dashboard REST API Integration & RBAC Tests', () => {
  test('GET /api/v1/dashboard returns 401 for unauthenticated request', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/dashboard', {
      headers: { authorization: 'Bearer mock-unauthorized' },
    });
    const res = await getOverview(req);
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/dashboard returns 403 for unauthorized cross-student data access', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/v1/dashboard?studentId=other-student-456',
      {
        headers: { authorization: 'Bearer mock-forbidden-student' },
      }
    );
    const res = await getOverview(req);
    expect(res.status).toBe(403);
  });

  test('GET /api/v1/dashboard returns 200 with valid DashboardOverviewDto for authenticated student', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/v1/dashboard?studentId=stud-active-123',
      {
        headers: { authorization: 'Bearer mock-valid-token' },
      }
    );
    const res = await getOverview(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.profile.studentName).toBeDefined();
    expect(body.progress.overallProgrammeProgress).toBeDefined();
    expect(body.assessmentSummary).toBeDefined();
    expect(body.aiSummary).toBeDefined();
  });

  test('GET /api/v1/dashboard/activity returns 200 with paginated activities', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/v1/dashboard/activity?page=1&pageSize=5',
      {
        headers: { authorization: 'Bearer mock-valid-token' },
      }
    );
    const res = await getActivity(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.activities).toBeDefined();
  });

  test('GET /api/v1/dashboard/calendar returns 200 with calendar events', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/dashboard/calendar?view=MONTH', {
      headers: { authorization: 'Bearer mock-valid-token' },
    });
    const res = await getCalendar(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.events).toBeDefined();
  });

  test('GET /api/v1/dashboard/achievements returns 200 with achievements DTO', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/dashboard/achievements', {
      headers: { authorization: 'Bearer mock-valid-token' },
    });
    const res = await getAchievements(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.badges).toBeDefined();
  });
});
