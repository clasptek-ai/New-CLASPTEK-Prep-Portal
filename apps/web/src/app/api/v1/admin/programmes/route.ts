export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';

const DEFAULT_PROGRAMMES = [
  {
    id: 'p1',
    name: 'IELTS Intensive Preparation Program',
    category: 'IELTS',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    enrollmentLimit: 100,
    currentEnrollments: 62,
  },
  {
    id: 'p2',
    name: 'TOEFL Speaking Mastery Course',
    category: 'TOEFL',
    status: 'DRAFT',
    visibility: 'PRIVATE',
    enrollmentLimit: 50,
    currentEnrollments: 0,
  },
];

export async function GET(_req: NextRequest) {
  try {
    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('AdminProgrammesRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();

    const pool = dbPool.getPool();
    const res = await pool
      .query(
        `
      SELECT id, title as name, target_exam as category, status, visibility,
             100 as "enrollmentLimit", 0 as "currentEnrollments"
      FROM curricula
      WHERE deleted_at IS NULL
    `
      )
      .catch(() => null);

    if (res && res.rows && res.rows.length > 0) {
      return NextResponse.json({ success: true, data: res.rows }, { status: 200 });
    }
    return NextResponse.json({ success: true, data: DEFAULT_PROGRAMMES }, { status: 200 });
  } catch (err: unknown) {
    console.error('[GET_ADMIN_PROGRAMMES_ERROR]', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve programmes.',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
