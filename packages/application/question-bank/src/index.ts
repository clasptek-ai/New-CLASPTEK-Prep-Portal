import {
  Question,
  QuestionCode,
  SemanticVersion,
  ReviewRequest,
  QuestionVersion
} from '@clasptek/domain-question-bank';
import { randomUUID } from 'crypto';

// 1. Repository and Filter Interfaces
export interface QuestionSearchFilters {
  examProductId?: string;
  curriculumModuleId?: string;
  questionType?: string;
  difficulty?: string;
  language?: string;
  status?: string;
  tags?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ImportHistory {
  importId: string;
  timestamp: Date;
  status: string;
}

export interface QuestionRepository {
  save(question: Question): Promise<void>;
  findById(id: string): Promise<Question | null>;
  findByCode(code: string): Promise<Question | null>;
  findPublished(id: string): Promise<Question | null>;
  findVersion(questionId: string, versionNo: string): Promise<QuestionVersion | null>;
  publish(id: string, versionNo: string): Promise<void>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  duplicate(id: string): Promise<string>;
  search(filters: QuestionSearchFilters): Promise<Question[]>;
  nextIdentity(): string;
}

export interface QuestionReviewRepository {
  save(review: ReviewRequest): Promise<void>;
  findById(id: string): Promise<ReviewRequest | null>;
  findByQuestionId(questionId: string): Promise<ReviewRequest | null>;
  nextIdentity(): string;
}

export interface QuestionImportRepository {
  preview(importId: string): Promise<any>;
  validate(payloads: any[]): Promise<ValidationResult>;
  approve(importId: string): Promise<void>;
  import(payloads: any[]): Promise<string[]>;
  rollback(importId: string): Promise<void>;
  history(): Promise<ImportHistory[]>;
}

// 2. Command Handlers

export class CreateQuestionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: {
    code: string;
    examProductId: string | null;
    curriculumModuleId: string | null;
  }): Promise<string> {
    const id = this.questionRepo.nextIdentity();
    const codeVo = new QuestionCode(cmd.code);
    const exists = await this.questionRepo.findByCode(cmd.code);
    if (exists) {
      throw new Error(`Question with code ${cmd.code} already exists`);
    }

    const question = Question.create(id, codeVo, cmd.examProductId, cmd.curriculumModuleId);
    await this.questionRepo.save(question);
    return id;
  }
}

export class CreateVersionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: {
    questionId: string;
    versionNo: string;
    title: string;
    payload: any;
    digitalSignature?: string;
  }): Promise<string> {
    const question = await this.questionRepo.findById(cmd.questionId);
    if (!question) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }

    const versionId = this.questionRepo.nextIdentity();
    const verNo = new SemanticVersion(cmd.versionNo);
    question.createVersion(versionId, verNo, cmd.title, cmd.payload, cmd.digitalSignature || null);

    await this.questionRepo.save(question);
    return versionId;
  }
}

export class PublishQuestionHandler {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly reviewRepo: QuestionReviewRepository
  ) {}

  public async execute(cmd: {
    questionId: string;
    versionNo: string;
  }): Promise<void> {
    const question = await this.questionRepo.findById(cmd.questionId);
    if (!question) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }

    // Verify workflow state is approved
    const review = await this.reviewRepo.findByQuestionId(cmd.questionId);
    if (!review || review.status !== 'APPROVED') {
      throw new Error(`Question ${cmd.questionId} has not been approved for publication`);
    }

    const verNo = new SemanticVersion(cmd.versionNo);
    question.publish(verNo);
    await this.questionRepo.save(question);
  }
}

export class ArchiveQuestionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: { questionId: string }): Promise<void> {
    const question = await this.questionRepo.findById(cmd.questionId);
    if (!question) {
      throw new Error(`Question ${cmd.questionId} not found`);
    }
    question.archive();
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

export class SubmitForReviewHandler {
  constructor(private readonly reviewRepo: QuestionReviewRepository) {}

  public async execute(cmd: { questionId: string }): Promise<string> {
    const id = this.reviewRepo.nextIdentity();
    const review = ReviewRequest.create(id, cmd.questionId);
    await this.reviewRepo.save(review);
    return id;
  }
}

export class AddReviewCommentHandler {
  constructor(private readonly reviewRepo: QuestionReviewRepository) {}

  public async execute(cmd: {
    questionId: string;
    reviewerId: string;
    role: string;
    commentText: string;
  }): Promise<void> {
    const review = await this.reviewRepo.findByQuestionId(cmd.questionId);
    if (!review) {
      throw new Error(`Review cycle not found for question ${cmd.questionId}`);
    }

    const commentId = randomUUID();
    review.addComment(commentId, cmd.reviewerId, cmd.role, cmd.commentText);
    await this.reviewRepo.save(review);
  }
}

export class ApproveVersionHandler {
  constructor(private readonly reviewRepo: QuestionReviewRepository) {}

  public async execute(cmd: {
    questionId: string;
    reviewerId: string;
    comments: string;
  }): Promise<void> {
    const review = await this.reviewRepo.findByQuestionId(cmd.questionId);
    if (!review) {
      throw new Error(`Review cycle not found for question ${cmd.questionId}`);
    }

    const historyId = randomUUID();
    review.approve(cmd.reviewerId, cmd.comments, historyId);
    await this.reviewRepo.save(review);
  }
}

export class ImportQuestionsHandler {
  constructor(
    private readonly importRepo: QuestionImportRepository
  ) {}

  public async execute(cmd: {
    payloads: any[];
  }): Promise<string[]> {
    const validation = await this.importRepo.validate(cmd.payloads);
    if (!validation.isValid) {
      throw new Error(`Import validation failed: ${validation.errors.join(', ')}`);
    }

    const ids = await this.importRepo.import(cmd.payloads);
    return ids;
  }
}

// 3. Query Handlers

export class SearchQuestionsHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(filters: QuestionSearchFilters): Promise<Question[]> {
    return this.questionRepo.search(filters);
  }
}

export class GetQuestionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(id: string): Promise<Question | null> {
    return this.questionRepo.findById(id);
  }
}

export class GetQuestionVersionHandler {
  constructor(private readonly questionRepo: QuestionRepository) {}

  public async execute(cmd: { questionId: string; versionNo: string }): Promise<QuestionVersion | null> {
    return this.questionRepo.findVersion(cmd.questionId, cmd.versionNo);
  }
}
