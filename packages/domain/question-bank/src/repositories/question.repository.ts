import { Question } from '../aggregates/question.aggregate';
import { QuestionReview } from '../aggregates/question-review.aggregate';
import { QuestionImport } from '../aggregates/question-import.aggregate';

export interface QuestionRepository {
  save(question: Question): Promise<void>;
  findById(id: string): Promise<Question | null>;
  findByCode(code: string): Promise<Question | null>;
  exists(code: string): Promise<boolean>;
  delete(id: string): Promise<void>;
  nextIdentity(): string;
}

export interface QuestionReviewRepository {
  save(review: QuestionReview): Promise<void>;
  findById(id: string): Promise<QuestionReview | null>;
  findByVersionId(versionId: string): Promise<QuestionReview[]>;
  nextIdentity(): string;
}

export interface QuestionImportRepository {
  save(importBatch: QuestionImport): Promise<void>;
  findById(id: string): Promise<QuestionImport | null>;
  existsDuplicateHash(hash: string): Promise<boolean>;
  saveDuplicateHash(hash: string, questionId: string): Promise<void>;
  nextIdentity(): string;
}
