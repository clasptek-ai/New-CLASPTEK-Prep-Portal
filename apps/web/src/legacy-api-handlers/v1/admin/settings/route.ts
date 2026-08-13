export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { AdminPlatformSettings } from '@/services/admin/settings.service';

const DEFAULT_SETTINGS: AdminPlatformSettings = {
  portalName: 'Clasptek Global Academy Portal',
  maintenanceMode: false,
  activeAcademicTerm: 'Summer-Fall 2026 Term',
  allowSelfRegistration: true,
  notificationDefaults: {
    emailAlerts: true,
    pushAlerts: true,
  },
  featureFlags: {
    enableAiCoach: true,
    enablePredictionEngine: true,
  },
};

// In-memory runtime cache for server-side persistence when DB is offline
let currentSettings: AdminPlatformSettings = { ...DEFAULT_SETTINGS };

export async function GET() {
  const logger = new ConsoleLogger('AdminSettingsAPI');

  try {
    const config = loadEnvironment(process.env);
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    const res = await pool.query(
      `SELECT metadata_key, metadata_value FROM platform_metadata WHERE metadata_key = 'platform_settings' LIMIT 1;`
    );

    if (res.rows && res.rows.length > 0 && res.rows[0].metadata_value) {
      const dbSettings =
        typeof res.rows[0].metadata_value === 'string'
          ? JSON.parse(res.rows[0].metadata_value)
          : res.rows[0].metadata_value;

      currentSettings = { ...DEFAULT_SETTINGS, ...dbSettings };
    }
  } catch (err) {
    logger.warn('Database lookup for platform_metadata bypassed, using active in-memory settings', {
      error: String(err),
    });
  }

  return NextResponse.json(currentSettings, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const logger = new ConsoleLogger('AdminSettingsAPI');

  try {
    const body: Partial<AdminPlatformSettings> = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid payload: settings object expected' },
        { status: 400 }
      );
    }

    currentSettings = {
      ...currentSettings,
      ...body,
      notificationDefaults: {
        ...currentSettings.notificationDefaults,
        ...(body.notificationDefaults || {}),
      },
      featureFlags: {
        ...currentSettings.featureFlags,
        ...(body.featureFlags || {}),
      },
    };

    try {
      const config = loadEnvironment(process.env);
      const dbPool = new DatabasePool(config, logger);
      await dbPool.connect();
      const pool = dbPool.getPool();

      await pool.query(
        `INSERT INTO platform_metadata (metadata_key, metadata_value, updated_at)
         VALUES ('platform_settings', $1::jsonb, NOW())
         ON CONFLICT (metadata_key)
         DO UPDATE SET metadata_value = EXCLUDED.metadata_value, updated_at = NOW();`,
        [JSON.stringify(currentSettings)]
      );
    } catch (dbErr) {
      logger.warn('Database persistence for platform_metadata bypassed, in-memory updated', {
        error: String(dbErr),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Platform settings updated successfully',
        settings: currentSettings,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    logger.error(
      'PATCH /api/v1/admin/settings failure',
      err instanceof Error ? err : new Error(String(err))
    );
    return NextResponse.json(
      { success: false, message: 'Failed to update platform settings' },
      { status: 500 }
    );
  }
}
