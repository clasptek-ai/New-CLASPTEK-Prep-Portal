import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  CreateQuestionHandler,
  CreateVersionHandler,
  PublishQuestionHandler,
  ApproveVersionHandler,
  SubmitForReviewHandler,
  QuestionRepository,
  QuestionReviewRepository,
} from './index';
import {
  Question,
  QuestionCode,
  SemanticVersion,
  ReviewRequest,
} from '@clasptek/domain-question-bank';

describe('Application Handlers Unit Tests', () => {
  let mockQuestionRepo: QuestionRepository;
  let mockReviewRepo: QuestionReviewRepository;
  let questions: Map<string, Question>;
  let reviews: Map<string, ReviewRequest>;

  beforeEach(() => {
    questions = new Map();
    reviews = new Map();

    mockQuestionRepo = {
      save: vi.fn().mockImplementation(async (q: Question) => {
        questions.set(q.id, q);
      }),
      findById: vi.fn().mockImplementation(async (id: string) => {
        return questions.get(id) || null;
      }),
      findByCode: vi.fn().mockImplementation(async (code: string) => {
        return Array.from(questions.values()).find((q) => q.code.value === code) || null;
      }),
      findPublished: vi.fn(),
      findVersion: vi.fn(),
      publish: vi.fn(),
      archive: vi.fn(),
      restore: vi.fn(),
      duplicate: vi.fn(),
      search: vi.fn(),
      nextIdentity: vi.fn().mockReturnValue('q-new-uuid'),
    };

    mockReviewRepo = {
      save: vi.fn().mockImplementation(async (r: ReviewRequest) => {
        reviews.set(r.id, r);
        reviews.set(r.questionId, r); // ease lookup by questionId too
      }),
      findById: vi.fn().mockImplementation(async (id: string) => {
        return reviews.get(id) || null;
      }),
      findByQuestionId: vi.fn().mockImplementation(async (qId: string) => {
        return reviews.get(qId) || null;
      }),
      nextIdentity: vi.fn().mockReturnValue('rev-new-uuid'),
    };
  });

  test('CreateQuestionHandler saves new question successfully', async () => {
    const handler = new CreateQuestionHandler(mockQuestionRepo);
    const qId = await handler.execute({
      code: 'IELTS-MCQ-1',
      examProductId: 'e-1',
      curriculumModuleId: 'm-1',
    });

    expect(qId).toBe('q-new-uuid');
    expect(questions.size).toBe(1);
    expect(questions.get('q-new-uuid')!.code.value).toBe('IELTS-MCQ-1');
  });

  test('CreateVersionHandler appends new draft version successfully', async () => {
    const q = Question.create('q-1', new QuestionCode('IELTS-Q1'), 'e-1', 'm-1');
    questions.set('q-1', q);

    const handler = new CreateVersionHandler(mockQuestionRepo);
    const verId = await handler.execute({
      questionId: 'q-1',
      versionNo: '1.0.0',
      title: 'Title',
      payload: { prompt: 'Q?' },
    });

    expect(verId).toBe('q-new-uuid');
    expect(q.versions.length).toBe(1);
    expect(q.versions[0].versionNo.value).toBe('1.0.0');
  });

  test('Approve and Publish version sequence completes successfully', async () => {
    const q = Question.create('q-1', new QuestionCode('IELTS-Q1'), 'e-1', 'm-1');
    q.createVersion('v-1', new SemanticVersion('1.0.0'), 'Title', {});
    questions.set('q-1', q);

    const reviewHandler = new SubmitForReviewHandler(mockReviewRepo);
    await reviewHandler.execute({ questionId: 'q-1' });

    const approveHandler = new ApproveVersionHandler(mockReviewRepo);
    await approveHandler.execute({
      questionId: 'q-1',
      reviewerId: 'reviewer-1',
      comments: 'Approved content',
    });

    const publishHandler = new PublishQuestionHandler(mockQuestionRepo, mockReviewRepo);
    await publishHandler.execute({
      questionId: 'q-1',
      versionNo: '1.0.0',
    });

    expect(q.status).toBe('PUBLISHED');
    expect(q.versions[0].status).toBe('PUBLISHED');
  });
});
