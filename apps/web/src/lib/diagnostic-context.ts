import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  DatabasePool,
  PostgresDiagnosticRepository,
  PostgresAssessmentFormRepository,
  PostgresAttemptRepository,
  PostgresResponseRepository,
  PostgresPlacementRepository,
  PostgresSkillProfileRepository,
  PostgresExposureLedgerRepository,
} from '@clasptek/persistence';
import {
  CreateDiagnosticHandler,
  StartAttemptHandler,
  SubmitResponseHandler,
  CalculatePlacementHandler,
} from '@clasptek/application-diagnostic-placement';

interface DiagnosticContext {
  dbPool: DatabasePool;
  logger: ConsoleLogger;
  createDiagnosticHandler: CreateDiagnosticHandler;
  startAttemptHandler: StartAttemptHandler;
  submitResponseHandler: SubmitResponseHandler;
  calculatePlacementHandler: CalculatePlacementHandler;
}

let cachedContext: DiagnosticContext | null = null;

export async function getDiagnosticContext(): Promise<DiagnosticContext> {
  if (cachedContext) {
    return cachedContext;
  }

  const config = loadEnvironment(process.env);
  const logger = new ConsoleLogger('DiagnosticContextManager');
  const dbPool = new DatabasePool(config, logger);

  await dbPool.connect();

  const diagnosticRepo = new PostgresDiagnosticRepository(dbPool.getPool());
  const formRepo = new PostgresAssessmentFormRepository(dbPool.getPool());
  const attemptRepo = new PostgresAttemptRepository(dbPool.getPool());
  const responseRepo = new PostgresResponseRepository(dbPool.getPool());
  const placementRepo = new PostgresPlacementRepository(dbPool.getPool());
  const skillRepo = new PostgresSkillProfileRepository(dbPool.getPool());
  const exposureRepo = new PostgresExposureLedgerRepository(dbPool.getPool());

  cachedContext = {
    dbPool,
    logger,
    createDiagnosticHandler: new CreateDiagnosticHandler(diagnosticRepo),
    startAttemptHandler: new StartAttemptHandler(attemptRepo),
    submitResponseHandler: new SubmitResponseHandler(attemptRepo, responseRepo, exposureRepo),
    calculatePlacementHandler: new CalculatePlacementHandler(
      attemptRepo,
      formRepo,
      placementRepo,
      skillRepo
    ),
  };

  return cachedContext;
}
