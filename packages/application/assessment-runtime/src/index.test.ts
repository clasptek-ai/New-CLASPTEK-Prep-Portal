import { describe, it, expect, vi } from 'vitest';
import {
  CreateAssessmentSessionHandler,
  StartAssessmentHandler,
  PauseAssessmentHandler,
  ResumeAssessmentHandler,
  SaveAnswerHandler,
  CreateCheckpointHandler,
  SubmitAssessmentHandler,
  type AssessmentSessionRepository,
  type AnswerSheetRepository,
  type CheckpointRepository,
} from './index';
import {
  AssessmentSession,
  StudentAnswerSheet,
} from '@clasptek/domain-assessment-runtime';

describe('Assessment Application Command Handlers', () => {
  const mkMocks = () => {
    let mockSessions = new Map<string, AssessmentSession>();
    let mockSheets = new Map<string, StudentAnswerSheet>();

    const sessionRepo: AssessmentSessionRepository = {
      save: vi.fn().mockImplementation(async (s: AssessmentSession) => {
        mockSessions.set(s.id, s);
      }),
      findById: vi.fn().mockImplementation(async (id: string) => {
        return mockSessions.get(id) || null;
      }),
      findActive: vi.fn().mockResolvedValue(null),
      archive: vi.fn(),
      restore: vi.fn(),
      search: vi.fn(),
      nextIdentity: vi.fn().mockReturnValue('mock-uuid'),
    };

    const sheetRepo: AnswerSheetRepository = {
      save: vi.fn().mockImplementation(async (s: StudentAnswerSheet) => {
        mockSheets.set(s.sessionId, s);
      }),
      saveAnswer: vi.fn(),
      find: vi.fn().mockImplementation(async (sessId: string) => {
        return mockSheets.get(sessId) || null;
      }),
      submit: vi.fn(),
    };

    const checkpointRepo: CheckpointRepository = {
      save: vi.fn(),
      restore: vi.fn(),
      deleteExpired: vi.fn(),
    };

    return { sessionRepo, sheetRepo, checkpointRepo, mockSessions, mockSheets };
  };

  it('runs CreateAssessmentSessionHandler to configure a new session', async () => {
    const { sessionRepo, sheetRepo } = mkMocks();
    const handler = new CreateAssessmentSessionHandler(sessionRepo, sheetRepo);

    const sessionId = await handler.execute({
      studentId: 'student-123',
      instanceId: 'inst-999',
    });

    expect(sessionId).toBe('mock-uuid');
    expect(sessionRepo.save).toHaveBeenCalledTimes(1);
    expect(sheetRepo.save).toHaveBeenCalledTimes(1);
  });

  it('runs StartAssessmentHandler lifecycle commands', async () => {
    const { sessionRepo, mockSessions } = mkMocks();
    const sheet = new StudentAnswerSheet({ id: 'sheet-1', sessionId: 'sess-1' });
    const session = new AssessmentSession({
      id: 'sess-1',
      studentId: 'student-1',
      instanceId: 'inst-1',
      status: 'READY',
      answerSheet: sheet,
    });
    mockSessions.set('sess-1', session);

    const startHandler = new StartAssessmentHandler(sessionRepo);
    await startHandler.execute({ sessionId: 'sess-1' });

    expect(session.status).toBe('ACTIVE');
    expect(sessionRepo.save).toHaveBeenCalledTimes(1);
  });

  it('runs Pause, Resume, and SaveAnswer handler steps', async () => {
    const { sessionRepo, sheetRepo, mockSessions } = mkMocks();
    const sheet = new StudentAnswerSheet({ id: 'sheet-1', sessionId: 'sess-1' });
    const session = new AssessmentSession({
      id: 'sess-1',
      studentId: 'student-1',
      instanceId: 'inst-1',
      status: 'READY',
      answerSheet: sheet,
    });
    mockSessions.set('sess-1', session);

    // Start
    await new StartAssessmentHandler(sessionRepo).execute({ sessionId: 'sess-1' });

    // Save Answer
    const saveAnswerHandler = new SaveAnswerHandler(sessionRepo, sheetRepo);
    await saveAnswerHandler.execute({
      sessionId: 'sess-1',
      questionId: 'q-1',
      questionVersionId: 'qv-1',
      payload: { value: 'option-a' },
      state: 'ANSWERED',
      timeSpentMs: 4000,
    });

    expect(sheetRepo.saveAnswer).toHaveBeenCalledTimes(1);
    expect(session.answerSheet.answers).toHaveLength(1);

    // Pause
    await new PauseAssessmentHandler(sessionRepo).execute({ sessionId: 'sess-1' });
    expect(session.status).toBe('PAUSED');

    // Resume
    await new ResumeAssessmentHandler(sessionRepo).execute({ sessionId: 'sess-1' });
    expect(session.status).toBe('RESUMED');
  });

  it('runs SubmitAssessmentHandler successfully', async () => {
    const { sessionRepo, sheetRepo, mockSessions } = mkMocks();
    const sheet = new StudentAnswerSheet({ id: 'sheet-1', sessionId: 'sess-1' });
    const session = new AssessmentSession({
      id: 'sess-1',
      studentId: 'student-1',
      instanceId: 'inst-1',
      status: 'ACTIVE',
      answerSheet: sheet,
    });
    mockSessions.set('sess-1', session);

    const submitHandler = new SubmitAssessmentHandler(sessionRepo, sheetRepo);
    await submitHandler.execute({
      sessionId: 'sess-1',
      signature: 'receipt-sig',
      serverId: 'app-server-1',
    });

    expect(session.status).toBe('SUBMITTED');
    expect(sheetRepo.submit).toHaveBeenCalledTimes(1);
    expect(sessionRepo.save).toHaveBeenCalledTimes(1);
  });

  it('runs CreateCheckpointHandler successfully', async () => {
    const { sessionRepo, checkpointRepo, mockSessions } = mkMocks();
    const sheet = new StudentAnswerSheet({ id: 'sheet-1', sessionId: 'sess-1' });
    const session = new AssessmentSession({
      id: 'sess-1',
      studentId: 'student-1',
      instanceId: 'inst-1',
      status: 'ACTIVE',
      answerSheet: sheet,
    });
    mockSessions.set('sess-1', session);

    const checkpointHandler = new CreateCheckpointHandler(sessionRepo, checkpointRepo);
    await checkpointHandler.execute({
      sessionId: 'sess-1',
      checkpointVersion: 1,
      activeQuestionId: 'q-1',
      elapsedTimeMs: 15000,
      answersSnapshot: { 'qv-1': 'option-a' },
      checksum: 'chk-123',
    });

    expect(session.checkpoint?.checkpointVersion).toBe(1);
    expect(checkpointRepo.save).toHaveBeenCalledTimes(1);
    expect(sessionRepo.save).toHaveBeenCalledTimes(1);
  });
});
