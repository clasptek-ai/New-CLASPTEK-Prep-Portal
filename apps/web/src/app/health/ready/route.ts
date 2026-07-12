import { NextResponse } from 'next/server';
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool } from '@clasptek/persistence';

const logger = new ConsoleLogger('HealthReadyAPI');

export async function GET() {
  try {
    const config = loadEnvironment(process.env);
    const db = new DatabasePool(config, logger);
    await db.connect();
    const dbReady = db.getStatus();
    await db.disconnect();

    if (dbReady) {
      return NextResponse.json({
        status: 'ready',
        db: 'connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({ status: 'not ready', db: 'disconnected' }, { status: 503 });
    }
  } catch (err: unknown) {
    const errorInstance = err instanceof Error ? err : new Error(String(err));
    logger.error('Readiness check encountered critical failure', errorInstance);
    return NextResponse.json(
      { status: 'not ready', error: errorInstance.message },
      { status: 503 }
    );
  }
}
