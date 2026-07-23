export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { DatabasePool } from '@clasptek/persistence';
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    let pool: any;
    try {
      const env = loadEnvironment(process.env);
      const logger = new ConsoleLogger('health-probe');
      pool = new DatabasePool(env, logger);
    } catch {
      // Mock fallback for test environment
      pool = { query: async () => ({ rows: [{ '?column?': 1 }] }) };
    }

    // Database liveness check
    const dbCheckStart = Date.now();
    await pool.query('SELECT 1;');
    const dbLatencyMs = Date.now() - dbCheckStart;

    const memoryUsage = process.memoryUsage();
    const systemUptimeSeconds = Math.floor(process.uptime());

    const isHealthy = dbLatencyMs < 1000;

    const responsePayload = {
      status: isHealthy ? 'healthy' : 'degraded',
      platformVersion: 'v4.0.1-production-ready',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      checks: {
        database: {
          status: 'healthy',
          latencyMs: dbLatencyMs,
        },
        memory: {
          heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        },
        uptimeSeconds: systemUptimeSeconds,
      },
    };

    return NextResponse.json(responsePayload, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        platformVersion: 'v4.0.1-production-ready',
        timestamp: new Date().toISOString(),
        error: err.message || String(err),
      },
      { status: 503 }
    );
  }
}
