import { NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool } from '@clasptek/persistence';

const logger = new ConsoleLogger('DBHealthAPI');

export async function GET() {
  try {
    const config = loadEnvironment(process.env);
    const db = new DatabasePool(config, logger);
    await db.connect();

    // 1. Measure database query latency
    const start = Date.now();
    await db.getPool().query('SELECT 1');
    const latency = Date.now() - start;

    // 2. Query PostgreSQL version
    const versionRes = await db.getPool().query('SELECT version()');
    const pgVersion = versionRes.rows[0]?.version || 'unknown';

    // 3. Query current migration version
    let currentMigration = 'none';
    try {
      const migrationRes = await db
        .getPool()
        .query('SELECT name FROM migrations_log ORDER BY name DESC LIMIT 1');
      currentMigration = migrationRes.rows[0]?.name || 'none';
    } catch (migErr) {
      logger.error(
        'Failed to query migrations log',
        migErr instanceof Error ? migErr : new Error(String(migErr))
      );
    }

    // 4. Retrieve connection pool status
    const pool = db.getPool();
    const totalConnections = pool.totalCount;
    const idleConnections = pool.idleCount;
    const activeConnections = totalConnections - idleConnections;
    const waitingRequests = pool.waitingCount;

    // 5. Extract Supabase Project ID
    const supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectId = supabaseUrl ? supabaseUrl.replace('https://', '').split('.')[0] : 'unknown';

    await db.disconnect();

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        postgresVersion: pgVersion,
        migrationVersion: currentMigration,
        latencyMs: latency,
        pool: {
          total: totalConnections,
          idle: idleConnections,
          active: activeConnections,
          waiting: waitingRequests,
        },
      },
      supabase: {
        projectId,
        configured: !!config.NEXT_PUBLIC_SUPABASE_URL && !!config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      environment: config.NODE_ENV,
      configVersion: config.CONFIG_VERSION,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorInstance = err instanceof Error ? err : new Error(String(err));
    logger.error('Database health check failed', errorInstance);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: {
          connected: false,
        },
        error: errorInstance.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
