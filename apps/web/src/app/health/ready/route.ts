export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool } from '@clasptek/persistence';

const logger = new ConsoleLogger('HealthReadyAPI');

export async function GET() {
  try {
    // 1. Verify Environment configuration parameters
    const config = loadEnvironment(process.env);

    // 2. Verify Database reachability
    const db = new DatabasePool(config, logger);
    await db.connect();
    const dbReady = db.getStatus();
    await db.disconnect();

    // 3. Verify Supabase configuration status
    const supabaseConfigured =
      !!config.NEXT_PUBLIC_SUPABASE_URL && !!config.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (dbReady && supabaseConfigured) {
      return NextResponse.json({
        status: 'ready',
        database: 'connected',
        supabase: 'configured',
        configVersion: config.CONFIG_VERSION,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          status: 'not ready',
          database: dbReady ? 'connected' : 'disconnected',
          supabase: supabaseConfigured ? 'configured' : 'misconfigured',
        },
        { status: 503 }
      );
    }
  } catch (err: unknown) {
    const errorInstance = err instanceof Error ? err : new Error(String(err));
    logger.error('Readiness check encountered critical failure', errorInstance);
    return NextResponse.json(
      {
        status: 'not ready',
        error: 'Critical infrastructure services unavailable',
      },
      { status: 503 }
    );
  }
}
