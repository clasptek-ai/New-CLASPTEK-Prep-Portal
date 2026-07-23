import { DatabasePool } from '@clasptek/persistence';
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  PostgresMockTemplateRepository,
  PostgresMockSessionRepository,
  PostgresMockAttemptRepository,
  PostgresMockResultRepository,
  PostgresMockReportRepository,
  PostgresMockReadinessRepository,
} from '@clasptek/persistence';
import {
  StartMockHandler,
  SubmitAnswerHandler,
  CompleteSectionHandler,
  SubmitMockHandler,
  CalculateReadinessHandler,
  GenerateReportHandler,
  GetHistoryHandler,
  GetTemplatesHandler,
  MockSessionOrchestrator,
  ScoreCalculationOrchestrator,
} from '@clasptek/application-mock-examination';

export interface MockExaminationContext {
  startMock: StartMockHandler;
  submitAnswer: SubmitAnswerHandler;
  completeSection: CompleteSectionHandler;
  submitMock: SubmitMockHandler;
  calculateReadiness: CalculateReadinessHandler;
  generateReport: GenerateReportHandler;
  getHistory: GetHistoryHandler;
  getTemplates: GetTemplatesHandler;
}

let contextInstance: MockExaminationContext | null = null;

export function getMockExaminationContext(): MockExaminationContext {
  if (contextInstance) return contextInstance;

  const env = loadEnvironment();
  const logger = new ConsoleLogger('mock-examination-context');
  const dbPool = new DatabasePool(env, logger);

  const templateRepo = new PostgresMockTemplateRepository(dbPool);
  const sessionRepo = new PostgresMockSessionRepository(dbPool);
  const attemptRepo = new PostgresMockAttemptRepository(dbPool);
  const resultRepo = new PostgresMockResultRepository(dbPool);
  const reportRepo = new PostgresMockReportRepository(dbPool);
  const readinessRepo = new PostgresMockReadinessRepository(dbPool);

  const sessionOrchestrator = new MockSessionOrchestrator(sessionRepo, attemptRepo);
  const scoreOrchestrator = new ScoreCalculationOrchestrator(
    sessionRepo,
    attemptRepo,
    templateRepo,
    resultRepo
  );

  contextInstance = {
    startMock: new StartMockHandler(sessionOrchestrator),
    submitAnswer: new SubmitAnswerHandler(attemptRepo),
    completeSection: new CompleteSectionHandler(sessionRepo),
    submitMock: new SubmitMockHandler(sessionRepo, scoreOrchestrator),
    calculateReadiness: new CalculateReadinessHandler(resultRepo, readinessRepo),
    generateReport: new GenerateReportHandler(resultRepo, reportRepo),
    getHistory: new GetHistoryHandler(resultRepo),
    getTemplates: new GetTemplatesHandler(templateRepo),
  };

  return contextInstance;
}
