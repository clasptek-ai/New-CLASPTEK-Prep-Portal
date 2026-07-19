import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool, PostgresQuestionRepository, PostgresQuestionReviewRepository, PostgresQuestionImportRepository } from '@clasptek/persistence';
import {
  CreateQuestionHandler,
  CreateVersionHandler,
  PublishQuestionHandler,
  ArchiveQuestionHandler,
  RestoreQuestionHandler,
  SubmitForReviewHandler,
  AddReviewCommentHandler,
  ApproveVersionHandler,
  ImportQuestionsHandler,
  SearchQuestionsHandler,
  GetQuestionHandler,
  GetQuestionVersionHandler
} from '@clasptek/application-question-bank';

interface QuestionBankContext {
  dbPool: DatabasePool;
  logger: ConsoleLogger;
  questionRepo: PostgresQuestionRepository;
  reviewRepo: PostgresQuestionReviewRepository;
  importRepo: PostgresQuestionImportRepository;

  createQuestionHandler: CreateQuestionHandler;
  createVersionHandler: CreateVersionHandler;
  publishQuestionHandler: PublishQuestionHandler;
  archiveQuestionHandler: ArchiveQuestionHandler;
  restoreQuestionHandler: RestoreQuestionHandler;
  submitForReviewHandler: SubmitForReviewHandler;
  addReviewCommentHandler: AddReviewCommentHandler;
  approveVersionHandler: ApproveVersionHandler;
  importQuestionsHandler: ImportQuestionsHandler;

  searchQuestionsHandler: SearchQuestionsHandler;
  getQuestionHandler: GetQuestionHandler;
  getQuestionVersionHandler: GetQuestionVersionHandler;
}

let cachedContext: QuestionBankContext | null = null;

export async function getQuestionBankContext(): Promise<QuestionBankContext> {
  if (cachedContext) {
    return cachedContext;
  }

  const config = loadEnvironment(process.env);
  const logger = new ConsoleLogger('QuestionBankContextManager');
  const dbPool = new DatabasePool(config, logger);

  await dbPool.connect();

  const questionRepo = new PostgresQuestionRepository(dbPool);
  const reviewRepo = new PostgresQuestionReviewRepository(dbPool);
  const importRepo = new PostgresQuestionImportRepository(dbPool);

  cachedContext = {
    dbPool,
    logger,
    questionRepo,
    reviewRepo,
    importRepo,

    createQuestionHandler: new CreateQuestionHandler(questionRepo),
    createVersionHandler: new CreateVersionHandler(questionRepo),
    publishQuestionHandler: new PublishQuestionHandler(questionRepo, reviewRepo),
    archiveQuestionHandler: new ArchiveQuestionHandler(questionRepo),
    restoreQuestionHandler: new RestoreQuestionHandler(questionRepo),
    submitForReviewHandler: new SubmitForReviewHandler(reviewRepo),
    addReviewCommentHandler: new AddReviewCommentHandler(reviewRepo),
    approveVersionHandler: new ApproveVersionHandler(reviewRepo),
    importQuestionsHandler: new ImportQuestionsHandler(importRepo),

    searchQuestionsHandler: new SearchQuestionsHandler(questionRepo),
    getQuestionHandler: new GetQuestionHandler(questionRepo),
    getQuestionVersionHandler: new GetQuestionVersionHandler(questionRepo)
  };

  return cachedContext;
}
