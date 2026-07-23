import { describe, test, expect, vi } from 'vitest';
import {
  StartMockHandler,
  SubmitAnswerHandler,
  SubmitMockHandler,
  GetTemplatesHandler,
  MockSessionOrchestrator,
  ScoreCalculationOrchestrator,
  type MockSessionRepository,
  type MockAttemptRepository,
  type MockTemplateRepository,
  type MockResultRepository,
} from './index';
import {
  MockSession,
  MockAttempt,
  MockResult,
  MockTemplate,
} from '@clasptek/domain-mock-examination';

function mkMockSessionRepo(): MockSessionRepository {
  const store = new Map<string, MockSession>();
  return {
    save: vi.fn(async (s) => {
      store.set(s.id, s);
    }),
    findById: vi.fn(async (id) => store.get(id) ?? null),
    findActive: vi.fn(
      async (sId) =>
        Array.from(store.values()).find((s) => s.studentId === sId && s.status === 'IN_PROGRESS') ??
        null
    ),
    findByStudent: vi.fn(async (sId) =>
      Array.from(store.values()).filter((s) => s.studentId === sId)
    ),
    nextIdentity: () => 'sess-uuid',
  };
}

function mkMockAttemptRepo(): MockAttemptRepository {
  const store = new Map<string, MockAttempt>();
  return {
    save: vi.fn(async (a) => {
      store.set(a.sessionId, a);
    }),
    findBySession: vi.fn(async (sId) => store.get(sId) ?? null),
    nextIdentity: () => 'att-uuid',
  };
}

function mkMockTemplateRepo(): MockTemplateRepository {
  const t = new MockTemplate({
    id: 'temp-1',
    blueprintId: 'bp-1',
    version: 1,
    totalDurationMinutes: 90,
    passingScore: 70,
    scoringStrategy: 'IELTS',
    sections: [],
  });
  return {
    save: vi.fn(async () => {}),
    findById: vi.fn(async (id) => (id === 'temp-1' ? t : null)),
    findPublished: vi.fn(async () => [t]),
    nextIdentity: () => 'temp-uuid',
  };
}

function mkMockResultRepo(): MockResultRepository {
  const store = new Map<string, MockResult>();
  return {
    save: vi.fn(async (r) => {
      store.set(r.id, r);
    }),
    findBySession: vi.fn(
      async (sId) => Array.from(store.values()).find((r) => r.sessionId === sId) ?? null
    ),
    findByStudent: vi.fn(async (sId) =>
      Array.from(store.values()).filter((r) => r.studentId === sId)
    ),
    nextIdentity: () => 'res-uuid',
  };
}

describe('Mock Examination Application Handlers Unit Tests', () => {
  test('StartMockHandler orchestrates session start', async () => {
    const sessionRepo = mkMockSessionRepo();
    const attemptRepo = mkMockAttemptRepo();
    const orchestrator = new MockSessionOrchestrator(sessionRepo, attemptRepo);
    const handler = new StartMockHandler(orchestrator);

    const sessionId = await handler.execute({ studentId: 'stud-1', templateId: 'temp-1' });
    expect(sessionId).toBe('sess-uuid');
    const session = await sessionRepo.findById('sess-uuid');
    expect(session?.status).toBe('IN_PROGRESS');
  });

  test('SubmitAnswerHandler records answer in attempt', async () => {
    const attemptRepo = mkMockAttemptRepo();
    const handler = new SubmitAnswerHandler(attemptRepo);

    await handler.execute({
      sessionId: 'sess-1',
      studentId: 'stud-1',
      questionId: 'q-1',
      sectionId: 'sec-1',
      answerPayload: 'B',
      timeSpentMs: 15000,
    });

    const attempt = await attemptRepo.findBySession('sess-1');
    expect(attempt?.answers).toHaveLength(1);
  });

  test('SubmitMockHandler scores attempt and saves result', async () => {
    const sessionRepo = mkMockSessionRepo();
    const attemptRepo = mkMockAttemptRepo();
    const templateRepo = mkMockTemplateRepo();
    const resultRepo = mkMockResultRepo();

    const session = new MockSession({
      id: 'sess-1',
      studentId: 'stud-1',
      templateId: 'temp-1',
      status: 'IN_PROGRESS',
    });
    await sessionRepo.save(session);

    const scoreOrchestrator = new ScoreCalculationOrchestrator(
      sessionRepo,
      attemptRepo,
      templateRepo,
      resultRepo
    );
    const handler = new SubmitMockHandler(sessionRepo, scoreOrchestrator);

    const result = await handler.execute({ sessionId: 'sess-1' });
    expect(result.officialScoreLabel).toContain('IELTS');
    const saved = await sessionRepo.findById('sess-1');
    expect(saved?.status).toBe('SUBMITTED');
  });

  test('GetTemplatesHandler returns published templates', async () => {
    const templateRepo = mkMockTemplateRepo();
    const handler = new GetTemplatesHandler(templateRepo);
    const templates = await handler.execute();
    expect(templates).toHaveLength(1);
  });
});
