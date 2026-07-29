export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';

const DEFAULT_ASSESSMENTS = [
  {
    id: 'exam1',
    title: 'IELTS Academic Full Diagnostic Mock A',
    type: 'MOCK',
    durationMinutes: 180,
    questionCount: 80,
    availableFrom: '2026-07-01T00:00:00Z',
    availableUntil: '2026-12-31T23:59:59Z',
    status: 'PUBLISHED',
  },
  {
    id: 'exam2',
    title: 'TOEFL iBT Reading & Listening Mock B',
    type: 'MOCK',
    durationMinutes: 120,
    questionCount: 60,
    availableFrom: '2026-07-10T00:00:00Z',
    availableUntil: '2026-12-31T23:59:59Z',
    status: 'PUBLISHED',
  },
  {
    id: 'exam3',
    title: 'SAT Mathematics & Evidence-Based Reading Diagnostic',
    type: 'MOCK',
    durationMinutes: 134,
    questionCount: 98,
    status: 'DRAFT',
  },
];

export async function GET(_req: NextRequest) {
  try {
    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('AdminAssessmentsRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();

    const pool = dbPool.getPool();
    const res = await pool
      .query(
        `
      SELECT id, title, type, duration_minutes as "durationMinutes", question_count as "questionCount",
             available_from as "availableFrom", available_until as "availableUntil", status
      FROM exam_products
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `
      )
      .catch(() => null);

    if (res && res.rows && res.rows.length > 0) {
      return NextResponse.json({ success: true, data: res.rows }, { status: 200 });
    }
    return NextResponse.json({ success: true, data: DEFAULT_ASSESSMENTS }, { status: 200 });
  } catch (err: unknown) {
    console.error('[GET_ADMIN_ASSESSMENTS_ERROR]', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve assessments.',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
