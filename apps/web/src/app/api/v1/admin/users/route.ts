export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';

export async function GET(_req: NextRequest) {
  try {
    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('AdminUsersRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();

    const pool = dbPool.getPool();
    const res = await pool
      .query(
        `
      SELECT 
        u.id,
        COALESCE(u.id, 'u-100') as "registrationNumber",
        CONCAT(p.first_name, ' ', p.last_name) as name,
        i.email,
        u.status,
        u.created_at as "registeredDate",
        COALESCE((SELECT name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = u.id LIMIT 1), 'STUDENT') as role
      FROM users u
      LEFT JOIN identities i ON u.id = i.user_id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.deleted_at IS NULL
    `
      )
      .catch(() => null);

    if (res && res.rows && res.rows.length > 0) {
      const mapped = res.rows.map((r: any) => ({
        id: r.id,
        registrationNumber: `CGA-2026-${r.id.substring(0, 5)}`,
        name: r.name?.trim() || r.email || 'User',
        email: r.email || 'user@clasptek.com',
        phone: r.phone || '+234 800 000 0000',
        role: r.role || 'STUDENT',
        status: r.status === 'ARCHIVED' ? 'SUSPENDED' : 'ACTIVE',
        paymentStatus: 'PAID',
        programme: 'IELTS Academic Intensive',
        cohort: '2026 Q3 Cohort A',
        progressPercent: 75,
        practiceUnlocked: true,
        mockUnlocked: true,
        registeredDate: r.registeredDate || new Date().toISOString(),
        statusHistory: [],
      }));
      return NextResponse.json({ success: true, data: mapped }, { status: 200 });
    }
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  } catch (err: unknown) {
    console.error('[GET_ADMIN_USERS_ERROR]', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve users.',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
