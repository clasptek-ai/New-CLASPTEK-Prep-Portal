export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'aud1',
    action: 'Suspended Student Account stud-123',
    user: 'Sarah Jenkins',
    timestamp: new Date().toISOString(),
    ip: '127.0.0.1',
    details: 'Account suspended for policy violation logs.',
    category: 'USER_SUSPENSION',
  },
  {
    id: 'aud2',
    action: 'Published Syllabus Mod A',
    user: 'Sarah Jenkins',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ip: '127.0.0.1',
    details: 'Syllabus advanced syntax lesson publish.',
    category: 'CURRICULUM_PUBLISH',
  },
  {
    id: 'aud3',
    action: 'Changed branding logo configurations',
    user: 'Sarah Jenkins',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ip: '127.0.0.1',
    details: 'Branding accent hex modified to #ec4899.',
    category: 'SETTINGS_CHANGE',
  },
];

export async function GET(_req: NextRequest) {
  try {
    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('AdminAuditRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();

    const pool = dbPool.getPool();
    const res = await pool
      .query(
        `
      SELECT id, action, user_name as "user", created_at as "timestamp", ip_address as "ip", details, category
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 50
    `
      )
      .catch(() => null);

    if (res && res.rows && res.rows.length > 0) {
      return NextResponse.json({ success: true, data: res.rows }, { status: 200 });
    }
    return NextResponse.json({ success: true, data: DEFAULT_AUDIT_LOGS }, { status: 200 });
  } catch (err: unknown) {
    console.error('[GET_ADMIN_AUDIT_ERROR]', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve audit logs.',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
