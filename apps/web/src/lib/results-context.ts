import {
  DatabasePool,
  PostgresAcademicProgressRepository,
  PostgresDownloadableReportRepository,
} from '@clasptek/persistence';
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  PublishResultsHandler,
  GenerateReportHandler,
  RefreshProgressHandler,
  ArchiveResultsHandler,
  GetStudentResultsHandler,
  GetProgressHandler,
  GetPerformanceHistoryHandler,
  GetReportHandler,
} from '@clasptek/application-results';

export interface ResultsContext {
  resultsRepo: PostgresAcademicProgressRepository;
  reportRepo: PostgresDownloadableReportRepository;
  publishResults: PublishResultsHandler;
  generateReport: GenerateReportHandler;
  refreshProgress: RefreshProgressHandler;
  archiveResults: ArchiveResultsHandler;
  getStudentResults: GetStudentResultsHandler;
  getProgress: GetProgressHandler;
  getPerformanceHistory: GetPerformanceHistoryHandler;
  getReport: GetReportHandler;
}

let cachedContext: ResultsContext | null = null;

export function getResultsContext(): ResultsContext {
  if (cachedContext) return cachedContext;

  const env = loadEnvironment(process.env);
  const logger = new ConsoleLogger('results-context');
  const pool = new DatabasePool(env, logger);

  const resultsRepo = new PostgresAcademicProgressRepository(pool);
  const reportRepo = new PostgresDownloadableReportRepository(pool);

  cachedContext = {
    resultsRepo,
    reportRepo,
    publishResults: new PublishResultsHandler(resultsRepo),
    generateReport: new GenerateReportHandler(resultsRepo, reportRepo),
    refreshProgress: new RefreshProgressHandler(resultsRepo),
    archiveResults: new ArchiveResultsHandler(resultsRepo),
    getStudentResults: new GetStudentResultsHandler(resultsRepo),
    getProgress: new GetProgressHandler(resultsRepo),
    getPerformanceHistory: new GetPerformanceHistoryHandler(resultsRepo),
    getReport: new GetReportHandler(reportRepo),
  };

  return cachedContext;
}
