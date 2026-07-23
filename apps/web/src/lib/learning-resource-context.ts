/* eslint-disable */
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  DatabasePool,
  PostgresLessonRepository,
  PostgresLearningResourceRepository,
} from '@clasptek/persistence';
import {
  CreateResourceHandler,
  PublishResourceVersionHandler,
  ArchiveResourceHandler,
  SearchResourcesHandler,
  GetResourceDetailHandler,
} from '@clasptek/application-learning-resources';
import { AddLessonHandler, GetLessonHandler } from '@clasptek/application-curriculum';

interface LearningResourceContext {
  dbPool: DatabasePool;
  logger: ConsoleLogger;
  lessonRepo: PostgresLessonRepository;
  resourceRepo: PostgresLearningResourceRepository;

  createLessonHandler: any;
  createResourceHandler: CreateResourceHandler;
  publishResourceHandler: any;
  publishResourceVersionHandler: PublishResourceVersionHandler;
  publishLessonHandler: any;
  archiveResourceHandler: ArchiveResourceHandler;
  uploadAttachmentHandler: any;
  generateTranscriptHandler: any;

  searchLessonsHandler: any;
  searchResourcesHandler: SearchResourcesHandler;
  getLessonHandler: any;
  getResourceHandler: GetResourceDetailHandler;
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

  const curriculumLessonRepo =
    new (require('@clasptek/persistence').PostgresCurriculumLessonRepository)(dbPool);
  const addLessonHandler = new AddLessonHandler(curriculumLessonRepo);
  const getLessonHandlerImpl = new GetLessonHandler(curriculumLessonRepo);
  const publishResourceVersionHandler = new PublishResourceVersionHandler(
    new (require('@clasptek/persistence').PostgresResourceVersionRepository)(dbPool)
  );

  cachedContext = {
    dbPool,
    logger,
    lessonRepo,
    resourceRepo,

    createLessonHandler: {
      execute: async (cmd: any) => {
        return await addLessonHandler.execute({
          learningModuleId: cmd.moduleId,
          code: cmd.code,
          title: cmd.name || cmd.title,
          summary: cmd.description || '',
          defaultSequenceNo: cmd.displayOrder || 1,
        });
      },
    },
    createResourceHandler: new CreateResourceHandler(resourceRepo),
    publishResourceHandler: {
      execute: async (cmd: any) => {
        if (typeof cmd === 'string') {
          return await publishResourceVersionHandler.execute({
            resourceVersionId: cmd,
            publishedBy: 'system',
          });
        }
        return await publishResourceVersionHandler.execute(cmd);
      },
    },
    publishResourceVersionHandler,
    publishLessonHandler: { execute: async () => {} },
    archiveResourceHandler: new ArchiveResourceHandler(resourceRepo),
    uploadAttachmentHandler: { execute: async () => {} },
    generateTranscriptHandler: { execute: async () => {} },

    searchLessonsHandler: { execute: async () => [] },
    searchResourcesHandler: new SearchResourcesHandler(dbPool.getPool()),
    getLessonHandler: getLessonHandlerImpl,
    getResourceHandler: new GetResourceDetailHandler(dbPool.getPool()),
  };

  return cachedContext;
}
