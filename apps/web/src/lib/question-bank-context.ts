/* eslint-disable @typescript-eslint/no-explicit-any */
import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import {
  DatabasePool,
  PostgresQuestionRepository,
  PostgresQuestionReviewRepository,
  PostgresQuestionImportRepository,
} from '@clasptek/persistence';
import {
  ArchiveQuestionHandler,
  RestoreQuestionHandler,
  SearchQuestionsHandler,
  GetQuestionHandler,
  GetQuestionVersionHandler,
} from '@clasptek/application-question-bank';
import {
  Question,
  QuestionCode,
  QuestionStatus,
  QuestionReview,
  QuestionImport,
} from '@clasptek/domain-question-bank';
import { randomUUID } from 'crypto';

class LegacyCreateQuestionHandler {
  constructor(private readonly questionRepo: PostgresQuestionRepository) {}
  public async execute(cmd: {
    code: string;
    examProductId?: string | null;
    curriculumModuleId?: string | null;
  }): Promise<string> {
    const codeVo = new QuestionCode(cmd.code);
    const exists = await this.questionRepo.exists(cmd.code);
    if (exists) {
      throw new Error(`Question ${cmd.code} already exists`);
    }
    const id = this.questionRepo.nextIdentity();
    const tenantId = '00000000-0000-0000-0000-000000000000';
    const question = Question.create(id, codeVo, null, tenantId);
    await this.questionRepo.save(question);
    return id;
  }
}

class LegacyCreateVersionHandler {
  constructor(private readonly questionRepo: PostgresQuestionRepository) {}
  public async execute(cmd: {
    questionId: string;
    versionNo: string;
    title: string;
    payload: Record<string, any>;
    digitalSignature?: string;
  }): Promise<string> {
    const q = await this.questionRepo.findById(cmd.questionId);
    if (!q) throw new Error(`Question ${cmd.questionId} not found`);
    const versionId = this.questionRepo.nextIdentity();
    const num = parseInt(cmd.versionNo.split('.')[0]) || q.versions.length + 1;
    q.createVersion(
      versionId,
      num,
      cmd.versionNo,
      cmd.payload.prompt || cmd.title || 'Prompt',
      cmd.payload,
      'Explanation'
    );
    await this.questionRepo.save(q);
    return versionId;
  }
}

class LegacyPublishQuestionHandler {
  constructor(private readonly questionRepo: PostgresQuestionRepository) {}
  public async execute(cmd: { questionId: string; versionNo: string }): Promise<void> {
    const q = await this.questionRepo.findById(cmd.questionId);
    if (!q) throw new Error(`Question ${cmd.questionId} not found`);
    const version = q.versions.find((v) => v.versionLabel === cmd.versionNo);
    if (!version) throw new Error(`Version ${cmd.versionNo} not found`);
    version.status = 'published';
    q.status = new QuestionStatus('published');
    q.currentVersionId = version.id;
    await this.questionRepo.save(q);
  }
}

class LegacySubmitForReviewHandler {
  constructor(private readonly reviewRepo: PostgresQuestionReviewRepository) {}
  public async execute(cmd: { questionId: string }): Promise<string> {
    const reviewId = this.reviewRepo.nextIdentity();
    const review = QuestionReview.create(reviewId, 'qv-1', 'peer_review', 'rev-99', cmd.questionId);
    await this.reviewRepo.save(review);
    return reviewId;
  }
}

class LegacyAddReviewCommentHandler {
  constructor(private readonly reviewRepo: PostgresQuestionReviewRepository) {}
  public async execute(cmd: {
    reviewId: string;
    reviewerId: string;
    commentText: string;
  }): Promise<void> {
    const review = await this.reviewRepo.findById(cmd.reviewId);
    if (review) {
      review.addComment(randomUUID(), cmd.reviewerId, 'reviewer', cmd.commentText);
      await this.reviewRepo.save(review);
    }
  }
}

class LegacyApproveVersionHandler {
  constructor(private readonly reviewRepo: PostgresQuestionReviewRepository) {}
  public async execute(cmd: { reviewId: string; reviewerId: string }): Promise<void> {
    const review = await this.reviewRepo.findById(cmd.reviewId);
    if (review) {
      review.status = 'approved';
      await this.reviewRepo.save(review);
    }
  }
}

class LegacyImportQuestionsHandler {
  constructor(
    private readonly importRepo: PostgresQuestionImportRepository,
    private readonly questionRepo: PostgresQuestionRepository
  ) {}
  public async execute(cmd: { payloads: any[] }): Promise<string[]> {
    const importId = this.importRepo.nextIdentity();
    const batch = QuestionImport.create(importId, 'csv');
    const ids: string[] = [];
    for (const p of cmd.payloads) {
      const codeVo = new QuestionCode(p.code);
      const id = this.questionRepo.nextIdentity();
      const tenantId = '00000000-0000-0000-0000-000000000000';
      const question = Question.create(id, codeVo, null, tenantId);
      const versionId = this.questionRepo.nextIdentity();
      question.createVersion(
        versionId,
        1,
        '1.0.0',
        p.prompt || p.title || 'Prompt',
        p,
        'Explanation'
      );
      await this.questionRepo.save(question);
      ids.push(id);
    }
    batch.completeImport(cmd.payloads.length);
    await this.importRepo.save(batch);
    return ids;
  }
}

interface QuestionBankContext {
  dbPool: DatabasePool;
  logger: ConsoleLogger;
  questionRepo: PostgresQuestionRepository;
  reviewRepo: PostgresQuestionReviewRepository;
  importRepo: PostgresQuestionImportRepository;

  createQuestionHandler: LegacyCreateQuestionHandler;
  createVersionHandler: LegacyCreateVersionHandler;
  publishQuestionHandler: LegacyPublishQuestionHandler;
  archiveQuestionHandler: ArchiveQuestionHandler;
  restoreQuestionHandler: RestoreQuestionHandler;
  submitForReviewHandler: LegacySubmitForReviewHandler;
  addReviewCommentHandler: LegacyAddReviewCommentHandler;
  approveVersionHandler: LegacyApproveVersionHandler;
  importQuestionsHandler: LegacyImportQuestionsHandler;

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

    createQuestionHandler: new LegacyCreateQuestionHandler(questionRepo),
    createVersionHandler: new LegacyCreateVersionHandler(questionRepo),
    publishQuestionHandler: new LegacyPublishQuestionHandler(questionRepo),
    archiveQuestionHandler: new ArchiveQuestionHandler(questionRepo),
    restoreQuestionHandler: new RestoreQuestionHandler(questionRepo),
    submitForReviewHandler: new LegacySubmitForReviewHandler(reviewRepo),
    addReviewCommentHandler: new LegacyAddReviewCommentHandler(reviewRepo),
    approveVersionHandler: new LegacyApproveVersionHandler(reviewRepo),
    importQuestionsHandler: new LegacyImportQuestionsHandler(importRepo, questionRepo),

    searchQuestionsHandler: new SearchQuestionsHandler(dbPool.getPool()),
    getQuestionHandler: new GetQuestionHandler(questionRepo),
    getQuestionVersionHandler: new GetQuestionVersionHandler(questionRepo),
  };

  return cachedContext;
}
