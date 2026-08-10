import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { AdminAnalyticsService } from '@/services/admin/analytics.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (
      !session ||
      (!session.roles.includes('ADMINISTRATOR') && !session.roles.includes('SYSTEM_ADMIN'))
    ) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get('type') || 'dashboard';

    if (type === 'dashboard') {
      const data = await AdminAnalyticsService.getDashboardMetrics();
      return NextResponse.json(data);
    }

    if (type === 'health') {
      const data = await AdminAnalyticsService.getInfrastructureHealth();
      return NextResponse.json(data);
    }

    if (type === 'students') {
      const data = await AdminAnalyticsService.getStudentAnalytics();
      return NextResponse.json(data);
    }

    if (type === 'question-bank') {
      const data = await AdminAnalyticsService.getQuestionBankMetrics();
      return NextResponse.json(data);
    }

    if (type === 'programmes') {
      const data = await AdminAnalyticsService.getProgrammeAnalytics();
      return NextResponse.json(data);
    }

    if (type === 'practice') {
      const data = await AdminAnalyticsService.getPracticeAnalytics();
      return NextResponse.json(data);
    }

    if (type === 'diagnostic') {
      const data = await AdminAnalyticsService.getDiagnosticAnalytics();
      return NextResponse.json(data);
    }

    if (type === 'mock') {
      const data = await AdminAnalyticsService.getMockAnalytics();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
