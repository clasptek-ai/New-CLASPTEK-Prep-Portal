import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool } from '@clasptek/persistence';

/**
 * @domain Infrastructure
 * @service Worker
 * Background queue worker bootstrap
 */

const logger = new ConsoleLogger('WorkerApp');

async function main() {
  logger.info('Initializing worker application...');
  const config = loadEnvironment(process.env);
  const db = new DatabasePool(config, logger);
  await db.connect();

  logger.info('Worker loop active. Monitoring outbox queue...');

  process.on('SIGINT', async () => {
    logger.info('Shutdown signal received. Cleansing references...');
    await db.disconnect();
    process.exit(0);
  });
}

main().catch((err) => {
  logger.error('Worker crashed during execution', err);
  process.exit(1);
});
