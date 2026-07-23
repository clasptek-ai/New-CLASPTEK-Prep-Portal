import {
  Question,
  QuestionCode,
  QuestionReview,
  QuestionImport,
  QuestionOwnership,
  QuestionRepository,
  QuestionReviewRepository,
  QuestionImportRepository,
} from '@clasptek/domain-question-bank';
import { randomUUID } from 'crypto';

export class CreateQuestionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: {
    code: string;
    parentQuestionId: string | null;
    tenantId: string;
  }): Promise<string> {
    const codeVo = new QuestionCode(cmd.code);
    const exists = await this.questionRepo.exists(cmd.code);
    if (exists) {
      throw new Error(`Question with code ${cmd.code} already exists`);
    }
    const id = this.questionRepo.nextIdentity();
    const question = Question.create(id, codeVo, cmd.parentQuestionId, cmd.tenantId);
    await this.questionRepo.save(question);
    return id;
  }
}

export class UpdateQuestionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: {
    questionId: string;
    versionId: string;
    prompt: string;
    payload: Record<string, any>;
    explanation: string | null;
  }): Promise<void> {
    const question = await this.questionRepo.findById(cmd.questionId);
    if (!question) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }
    const version = question.versions.find((v) => v.id === cmd.versionId);
    if (!version) {
      throw new Error(`QuestionVersion ${cmd.versionId} not found`);
    }
    if (version.status === 'published') {
      throw new Error('Cannot update a published question version.');
    }
    version.prompt = cmd.prompt;
    version.payload = cmd.payload;
    version.explanation = cmd.explanation;
    await this.questionRepo.save(question);
  }
}

export class SubmitReviewHandler {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly reviewRepo: QuestionReviewRepository
  ) {}

  public async execute(cmd: {
    questionId: string;
    versionId: string;
    reviewerId: string;
    stage: string;
  }): Promise<string> {
    const question = await this.questionRepo.findById(cmd.questionId);
    if (!question) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }
    const version = question.versions.find((v) => v.id === cmd.versionId);
    if (!version) {
      throw new Error(`Version ${cmd.versionId} not found`);
    }
    const reviewId = this.reviewRepo.nextIdentity();
    const review = QuestionReview.create(
      reviewId,
      cmd.versionId,
      cmd.stage,
      cmd.reviewerId,
      cmd.questionId
    );
    version.status = 'under_review';
    await this.reviewRepo.save(review);
    await this.questionRepo.save(question);
    return reviewId;
  }
}

export class RejectReviewHandler {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly reviewRepo: QuestionReviewRepository
  ) {}

  public async execute(cmd: {
    reviewId: string;
    reviewerId: string;
    comments: string;
    questionId: string;
  }): Promise<void> {
    const review = await this.reviewRepo.findById(cmd.reviewId);
    if (!review) {
      throw new Error(`Review ${cmd.reviewId} not found`);
    }
    const question = await this.questionRepo.findById(cmd.questionId);
    if (!question) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }
    review.reject(cmd.reviewerId, cmd.comments, cmd.questionId);
    const version = question.versions.find((v) => v.id === review.questionVersionId);
    if (version) {
      version.status = 'draft';
    }
    await this.reviewRepo.save(review);
    await this.questionRepo.save(question);
  }
}

export class PublishVersionHandler {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly reviewRepo: QuestionReviewRepository
  ) {}

  public async execute(cmd: {
    questionId: string;
    versionId: string;
    publishedBy: string;
  }): Promise<void> {
    const question = await this.questionRepo.findById(cmd.questionId);
    if (!question) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }
    const reviews = await this.reviewRepo.findByVersionId(cmd.versionId);
    const hasApproval = reviews.some(
      (r) => r.status === 'approved' && r.stage === 'editorial_signoff'
    );
    if (!hasApproval) {
      throw new Error('Cannot publish version without editorial sign-off approval.');
    }
    question.publish(cmd.versionId, cmd.publishedBy);
    await this.questionRepo.save(question);
  }
}

export class ArchiveQuestionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: { questionId: string; archivedBy: string }): Promise<void> {
    const question = await this.questionRepo.findById(cmd.questionId);
    if (!question) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }
    question.archive(cmd.archivedBy);
    await this.questionRepo.save(question);
  }
}

export class RestoreQuestionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: { questionId: string }): Promise<void> {
    const question = await this.questionRepo.findById(cmd.questionId);
    if (!question) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }
    question.restore();
    await this.questionRepo.save(question);
  }
}

export class DuplicateQuestionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: {
    questionId: string;
    newCode: string;
    tenantId: string;
  }): Promise<string> {
    const original = await this.questionRepo.findById(cmd.questionId);
    if (!original) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }
    const codeVo = new QuestionCode(cmd.newCode);
    const id = this.questionRepo.nextIdentity();
    const copy = Question.create(id, codeVo, original.parentQuestionId, cmd.tenantId);
    await this.questionRepo.save(copy);
    return id;
  }
}

export class MergeQuestionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: { sourceQuestionId: string; targetQuestionId: string }): Promise<void> {
    const source = await this.questionRepo.findById(cmd.sourceQuestionId);
    if (!source) {
      throw new Error(`Source question ${cmd.sourceQuestionId} not found`);
    }
    source.archive('system-merge');
    await this.questionRepo.save(source);
  }
}

export class BulkImportHandler {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly importRepo: QuestionImportRepository
  ) {}

  public async execute(cmd: {
    format: string;
    tenantId: string;
    records: Array<{
      code: string;
      prompt: string;
      payload: Record<string, any>;
      explanation: string | null;
    }>;
  }): Promise<string> {
    const importId = this.importRepo.nextIdentity();
    const batch = QuestionImport.create(importId, cmd.format);

    try {
      let importedCount = 0;
      for (const rec of cmd.records) {
        const hash = QuestionImport.computePayloadHash(rec.prompt, rec.payload);
        const isDuplicate = await this.importRepo.existsDuplicateHash(hash);
        if (isDuplicate) {
          continue; // duplicate detection skipping rule
        }
        const codeVo = new QuestionCode(rec.code);
        const questionId = this.questionRepo.nextIdentity();
        const question = Question.create(questionId, codeVo, null, cmd.tenantId);

        const versionId = randomUUID();
        question.createVersion(versionId, 1, 'v1.0.0', rec.prompt, rec.payload, rec.explanation);

        await this.questionRepo.save(question);
        await this.importRepo.saveDuplicateHash(hash, questionId);
        importedCount++;
      }
      batch.completeImport(importedCount);
      await this.importRepo.save(batch);
      return importId;
    } catch (err: any) {
      batch.failImport(err.message || 'Import failed');
      await this.importRepo.save(batch);
      throw err;
    }
  }
}

export class AssignOwnerHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: {
    questionId: string;
    ownerOrgId: string;
    licenseType: string;
    copyrightYear: number;
    attributionText: string | null;
  }): Promise<void> {
    const question = await this.questionRepo.findById(cmd.questionId);
    if (!question) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }
    const ownership = new QuestionOwnership(
      randomUUID(),
      cmd.questionId,
      cmd.ownerOrgId,
      cmd.licenseType,
      cmd.copyrightYear,
      cmd.attributionText
    );
    question.setOwnership(ownership);
    await this.questionRepo.save(question);
  }
}
