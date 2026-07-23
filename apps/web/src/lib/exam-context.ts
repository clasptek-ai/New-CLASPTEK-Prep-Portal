import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  DatabasePool,
  PostgresUnitOfWork,
  PostgresExamProductRepository,
  PostgresBlueprintRepository,
  PostgresSkillFrameworkRepository,
} from '@clasptek/persistence';
import { ExamProductPublishingService } from '@clasptek/domain-exam-product';
import {
  CreateExamProductHandler,
  PublishExamProductHandler,
  ArchiveExamProductHandler,
  CreateBlueprintHandler,
  GetExamProductsHandler,
  GetSkillHierarchyHandler,
  GetBlueprintHandler,
} from '@clasptek/application-exam-product';

interface ExamContext {
  dbPool: DatabasePool;
  logger: ConsoleLogger;
  uow: PostgresUnitOfWork;
  examProductRepo: PostgresExamProductRepository;
  blueprintRepo: PostgresBlueprintRepository;
  skillFrameworkRepo: PostgresSkillFrameworkRepository;

  createExamProductHandler: CreateExamProductHandler;
  publishExamProductHandler: PublishExamProductHandler;
  archiveExamProductHandler: ArchiveExamProductHandler;
  createBlueprintHandler: CreateBlueprintHandler;
  getExamProductsHandler: GetExamProductsHandler;
  getSkillHierarchyHandler: GetSkillHierarchyHandler;
  getBlueprintHandler: GetBlueprintHandler;
}

let cachedExamContext: ExamContext | null = null;

export async function getExamContext(): Promise<ExamContext> {
  if (cachedExamContext) {
    return cachedExamContext;
  }

  const config = loadEnvironment(process.env);
  const logger = new ConsoleLogger('ExamContextManager');
  const dbPool = new DatabasePool(config, logger);

  await dbPool.connect();

  const uow = new PostgresUnitOfWork(dbPool);
  const examProductRepo = new PostgresExamProductRepository(uow);
  const blueprintRepo = new PostgresBlueprintRepository(uow);
  const skillFrameworkRepo = new PostgresSkillFrameworkRepository(uow);

  const publishingService = new ExamProductPublishingService();

  cachedExamContext = {
    dbPool,
    logger,
    uow,
    examProductRepo,
    blueprintRepo,
    skillFrameworkRepo,

    createExamProductHandler: new CreateExamProductHandler(examProductRepo, uow),
    publishExamProductHandler: new PublishExamProductHandler(
      examProductRepo,
      publishingService,
      uow
    ),
    archiveExamProductHandler: new ArchiveExamProductHandler(examProductRepo, uow),
    createBlueprintHandler: new CreateBlueprintHandler(blueprintRepo, uow),
    getExamProductsHandler: new GetExamProductsHandler(examProductRepo),
    getSkillHierarchyHandler: new GetSkillHierarchyHandler(skillFrameworkRepo),
    getBlueprintHandler: new GetBlueprintHandler(blueprintRepo),
  };

  return cachedExamContext;
}

export type { ExamContext };
