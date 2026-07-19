import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { loadEnvironment } from '@clasptek/configuration';
import {
  PostgresAssessmentSessionRepository,
  PostgresAnswerSheetRepository,
  PostgresCheckpointRepository,
  PostgresRuntimeStatisticsRepository,
} from '@clasptek/persistence';
import {
  CreateAssessmentSessionHandler,
  StartAssessmentHandler,
  PauseAssessmentHandler,
  ResumeAssessmentHandler,
  SaveAnswerHandler,
  CreateCheckpointHandler,
  SubmitAssessmentHandler,
  ArchiveSessionHandler,
  GetAssessmentSessionHandler,
  GetAnswerSheetHandler,
  GetCheckpointHandler,
  GetRuntimeStatisticsHandler,
  GetNavigationHistoryHandler,
} from '@clasptek/application-assessment-runtime';

export interface AssessmentRuntimeContext {
  // Commands
  createSession: CreateAssessmentSessionHandler;
  startSession: StartAssessmentHandler;
  pauseSession: PauseAssessmentHandler;
  resumeSession: ResumeAssessmentHandler;
  saveAnswer: SaveAnswerHandler;
  createCheckpoint: CreateCheckpointHandler;
  submitSession: SubmitAssessmentHandler;
  archiveSession: ArchiveSessionHandler;
  // Queries
  getSession: GetAssessmentSessionHandler;
  getAnswerSheet: GetAnswerSheetHandler;
  getCheckpoint: GetCheckpointHandler;
  getStatistics: GetRuntimeStatisticsHandler;
  getNavigationHistory: GetNavigationHistoryHandler;
}

let cached: AssessmentRuntimeContext | null = null;

export function getAssessmentRuntimeContext(): AssessmentRuntimeContext {
  if (cached) return cached;

  const env = loadEnvironment();
  const logger = new ConsoleLogger('assessment-runtime-context');
  const dbPool = new DatabasePool(env, logger);

  const sessionRepo = new PostgresAssessmentSessionRepository(dbPool);
  const sheetRepo = new PostgresAnswerSheetRepository(dbPool);
  const checkpointRepo = new PostgresCheckpointRepository(dbPool);
  const statsRepo = new PostgresRuntimeStatisticsRepository(dbPool);

  cached = {
    // Commands
    createSession: new CreateAssessmentSessionHandler(sessionRepo, sheetRepo),
    startSession: new StartAssessmentHandler(sessionRepo),
    pauseSession: new PauseAssessmentHandler(sessionRepo),
    resumeSession: new ResumeAssessmentHandler(sessionRepo),
    saveAnswer: new SaveAnswerHandler(sessionRepo, sheetRepo),
    createCheckpoint: new CreateCheckpointHandler(sessionRepo, checkpointRepo),
    submitSession: new SubmitAssessmentHandler(sessionRepo, sheetRepo),
    archiveSession: new ArchiveSessionHandler(sessionRepo),
    // Queries
    getSession: new GetAssessmentSessionHandler(sessionRepo),
    getAnswerSheet: new GetAnswerSheetHandler(sheetRepo),
    getCheckpoint: new GetCheckpointHandler(checkpointRepo),
    getStatistics: new GetRuntimeStatisticsHandler(statsRepo),
    getNavigationHistory: new GetNavigationHistoryHandler(sessionRepo),
  };

  return cached;
}
