import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  DatabasePool,
  PostgresCurriculumRepository,
  PostgresCurriculumVersionRepository,
  PostgresLearningModuleRepository,
  PostgresCurriculumLessonRepository,
  PostgresCurriculumTemplateRepository,
  PostgresProjectionQuery,
} from '@clasptek/persistence';
import {
  CreateCurriculumHandler,
  UpdateCurriculumDraftHandler,
  CreateCurriculumVersionHandler,
  PublishCurriculumVersionHandler,
  SubmitCurriculumForReviewHandler,
  ApproveCurriculumVersionHandler,
  ArchiveCurriculumHandler,
  RestoreCurriculumHandler,
  DuplicateCurriculumHandler,
  AddLearningModuleHandler,
  AddLessonHandler,
  CreateCurriculumTemplateHandler,
  GetCurriculumHandler,
  GetLessonHandler,
  SearchCurriculaHandler,
} from '@clasptek/application-curriculum';

interface CurriculumContext {
  dbPool: DatabasePool;
  logger: ConsoleLogger;
  curriculumRepo: PostgresCurriculumRepository;
  versionRepo: PostgresCurriculumVersionRepository;
  moduleRepo: PostgresLearningModuleRepository;
  lessonRepo: PostgresCurriculumLessonRepository;
  templateRepo: PostgresCurriculumTemplateRepository;
  projectionQuery: PostgresProjectionQuery;

  createCurriculumHandler: CreateCurriculumHandler;
  updateCurriculumDraftHandler: UpdateCurriculumDraftHandler;
  createCurriculumVersionHandler: CreateCurriculumVersionHandler;
  publishCurriculumVersionHandler: PublishCurriculumVersionHandler;
  submitCurriculumForReviewHandler: SubmitCurriculumForReviewHandler;
  approveCurriculumVersionHandler: ApproveCurriculumVersionHandler;
  archiveCurriculumHandler: ArchiveCurriculumHandler;
  restoreCurriculumHandler: RestoreCurriculumHandler;
  duplicateCurriculumHandler: DuplicateCurriculumHandler;
  addLearningModuleHandler: AddLearningModuleHandler;
  addLessonHandler: AddLessonHandler;
  createCurriculumTemplateHandler: CreateCurriculumTemplateHandler;

  getCurriculumHandler: GetCurriculumHandler;
  getLessonHandler: GetLessonHandler;
  searchCurriculaHandler: SearchCurriculaHandler;
}

let cachedContext: CurriculumContext | null = null;

export async function getCurriculumContext(): Promise<CurriculumContext> {
  if (cachedContext) {
    return cachedContext;
  }

  const config = loadEnvironment(process.env);
  const logger = new ConsoleLogger('CurriculumContextManager');
  const dbPool = new DatabasePool(config, logger);

  await dbPool.connect();

  const curriculumRepo = new PostgresCurriculumRepository(dbPool);
  const versionRepo = new PostgresCurriculumVersionRepository(dbPool);
  const moduleRepo = new PostgresLearningModuleRepository(dbPool);
  const lessonRepo = new PostgresCurriculumLessonRepository(dbPool);
  const templateRepo = new PostgresCurriculumTemplateRepository(dbPool);
  const projectionQuery = new PostgresProjectionQuery(dbPool);

  cachedContext = {
    dbPool,
    logger,
    curriculumRepo,
    versionRepo,
    moduleRepo,
    lessonRepo,
    templateRepo,
    projectionQuery,

    createCurriculumHandler: new CreateCurriculumHandler(curriculumRepo),
    updateCurriculumDraftHandler: new UpdateCurriculumDraftHandler(curriculumRepo),
    createCurriculumVersionHandler: new CreateCurriculumVersionHandler(curriculumRepo, versionRepo),
    publishCurriculumVersionHandler: new PublishCurriculumVersionHandler(
      curriculumRepo,
      versionRepo
    ),
    submitCurriculumForReviewHandler: new SubmitCurriculumForReviewHandler(curriculumRepo),
    approveCurriculumVersionHandler: new ApproveCurriculumVersionHandler(curriculumRepo),
    archiveCurriculumHandler: new ArchiveCurriculumHandler(curriculumRepo),
    restoreCurriculumHandler: new RestoreCurriculumHandler(curriculumRepo),
    duplicateCurriculumHandler: new DuplicateCurriculumHandler(curriculumRepo),
    addLearningModuleHandler: new AddLearningModuleHandler(moduleRepo),
    addLessonHandler: new AddLessonHandler(lessonRepo),
    createCurriculumTemplateHandler: new CreateCurriculumTemplateHandler(templateRepo),

    getCurriculumHandler: new GetCurriculumHandler(curriculumRepo),
    getLessonHandler: new GetLessonHandler(lessonRepo),
    searchCurriculaHandler: new SearchCurriculaHandler(curriculumRepo),
  };

  return cachedContext;
}

export type { CurriculumContext };
