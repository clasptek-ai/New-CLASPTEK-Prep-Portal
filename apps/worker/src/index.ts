import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool } from '@clasptek/persistence';

/**
 * @domain Infrastructure
 * @service Worker
 * Background queue worker & analytics scheduler bootstrap
 */

const logger = new ConsoleLogger('WorkerApp');

export abstract class AnalyticsJob {
  public abstract readonly jobName: string;
  public abstract readonly scheduleDescription: string;
  public readonly maxRetries: number = 3;

  public async executeWithRetry(jobLogger: ConsoleLogger): Promise<void> {
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        attempt++;
        jobLogger.info(
          `[${this.jobName}] Executing job (Attempt ${attempt}/${this.maxRetries})...`
        );
        await this.run(jobLogger);
        jobLogger.info(`[${this.jobName}] Job completed successfully.`);
        return;
      } catch (err: any) {
        jobLogger.error(
          `[${this.jobName}] Execution failed on attempt ${attempt}: ${err.message || String(err)}`
        );
        if (attempt >= this.maxRetries) {
          jobLogger.error(`[${this.jobName}] Max retries exceeded. Moving to Dead Letter Queue.`);
          await this.onDeadLetter(err, jobLogger);
        }
      }
    }
  }

  protected abstract run(jobLogger: ConsoleLogger): Promise<void>;

  protected async onDeadLetter(error: any, jobLogger: ConsoleLogger): Promise<void> {
    jobLogger.error(`[${this.jobName}] DLQ Entry: ${error.message || String(error)}`);
  }
}

export class MetricsRefreshJob extends AnalyticsJob {
  public readonly jobName = 'HourlyMetricsRefreshJob';
  public readonly scheduleDescription = 'Hourly KPI Metric Refresh';

  protected async run(jobLogger: ConsoleLogger): Promise<void> {
    jobLogger.info('Refreshing metric definitions in catalog...');
  }
}

export class WarehouseAggregationJob extends AnalyticsJob {
  public readonly jobName = 'NightlyWarehouseAggregationJob';
  public readonly scheduleDescription = 'Nightly Warehouse Aggregation & Materialized View Refresh';

  protected async run(jobLogger: ConsoleLogger): Promise<void> {
    jobLogger.info('Aggregating warehouse snapshots...');
  }
}

export class BenchmarkJob extends AnalyticsJob {
  public readonly jobName = 'WeeklyBenchmarkJob';
  public readonly scheduleDescription = 'Weekly Institutional Benchmarks Calculation';

  protected async run(jobLogger: ConsoleLogger): Promise<void> {
    jobLogger.info('Computing institutional percentiles across cohorts...');
  }
}

export class ExecutiveReportJob extends AnalyticsJob {
  public readonly jobName = 'MonthlyExecutiveReportJob';
  public readonly scheduleDescription = 'Monthly Executive Insight Report Compilation';

  protected async run(jobLogger: ConsoleLogger): Promise<void> {
    jobLogger.info('Compiling executive findings into narrative insights...');
  }
}

export class ResearchExportJobWorker extends AnalyticsJob {
  public readonly jobName = 'ResearchExportJobWorker';
  public readonly scheduleDescription = 'Background Research Export Processor';

  protected async run(jobLogger: ConsoleLogger): Promise<void> {
    jobLogger.info('Processing queued research export jobs with anonymization...');
  }
}

async function main() {
  logger.info('Initializing worker application & Enterprise Analytics Scheduler...');
  const config = loadEnvironment(process.env);
  const db = new DatabasePool(config, logger);
  await db.connect();

  logger.info('Worker loop active. Monitoring outbox queue and scheduled jobs...');

  const scheduledJobs: AnalyticsJob[] = [
    new MetricsRefreshJob(),
    new WarehouseAggregationJob(),
    new BenchmarkJob(),
    new ExecutiveReportJob(),
    new ResearchExportJobWorker(),
  ];

  // Execute initial boot verification scan
  for (const job of scheduledJobs) {
    await job.executeWithRetry(logger);
  }

  process.on('SIGINT', async () => {
    logger.info('Shutdown signal received. Cleansing references...');
    await db.disconnect();
    process.exit(0);
  });
}

if (process.env.NODE_ENV !== 'test') {
  main().catch((err) => {
    logger.error('Worker crashed during execution', err);
    process.exit(1);
  });
}
