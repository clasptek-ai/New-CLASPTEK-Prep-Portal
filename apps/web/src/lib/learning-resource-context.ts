import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool, PostgresLessonRepository, PostgresLearningResourceRepository } from '@clasptek/persistence';
import {
  CreateLessonHandler,
  CreateResourceHandler,
  PublishResourceHandler,
  PublishLessonHandler,
  ArchiveResourceHandler,
  UploadAttachmentHandler,
  GenerateTranscriptHandler,
  SearchLessonsHandler,
  SearchResourcesHandler,
  GetLessonHandler,
  GetResourceHandler
} from '@clasptek/application-learning-resources';

interface LearningResourceContext {
  dbPool: DatabasePool;
  logger: ConsoleLogger;
  lessonRepo: PostgresLessonRepository;
  resourceRepo: PostgresLearningResourceRepository;

  createLessonHandler: CreateLessonHandler;
  createResourceHandler: CreateResourceHandler;
  publishResourceHandler: PublishResourceHandler;
  publishLessonHandler: PublishLessonHandler;
  archiveResourceHandler: ArchiveResourceHandler;
  uploadAttachmentHandler: UploadAttachmentHandler;
  generateTranscriptHandler: GenerateTranscriptHandler;

  searchLessonsHandler: SearchLessonsHandler;
  searchResourcesHandler: SearchResourcesHandler;
  getLessonHandler: GetLessonHandler;
  getResourceHandler: GetResourceHandler;
}

let cachedContext: LearningResourceContext | null = null;

export async function getLearningResourceContext(): Promise<LearningResourceContext> {
  if (cachedContext) {
    return cachedContext;
  }

  const config = loadEnvironment(process.env);
  const logger = new ConsoleLogger('LearningResourceContextManager');
  const dbPool = new DatabasePool(config, logger);

  await dbPool.connect();

  const lessonRepo = new PostgresLessonRepository(dbPool);
  const resourceRepo = new PostgresLearningResourceRepository(dbPool);

  cachedContext = {
    dbPool,
    logger,
    lessonRepo,
    resourceRepo,

    createLessonHandler: new CreateLessonHandler(lessonRepo),
    createResourceHandler: new CreateResourceHandler(resourceRepo),
    publishResourceHandler: new PublishResourceHandler(resourceRepo),
    publishLessonHandler: new PublishLessonHandler(lessonRepo),
    archiveResourceHandler: new ArchiveResourceHandler(resourceRepo),
    uploadAttachmentHandler: new UploadAttachmentHandler(resourceRepo),
    generateTranscriptHandler: new GenerateTranscriptHandler(resourceRepo),

    searchLessonsHandler: new SearchLessonsHandler(lessonRepo),
    searchResourcesHandler: new SearchResourcesHandler(resourceRepo),
    getLessonHandler: new GetLessonHandler(lessonRepo),
    getResourceHandler: new GetResourceHandler(resourceRepo)
  };

  return cachedContext;
}
