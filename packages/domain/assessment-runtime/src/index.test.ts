import { describe, it, expect } from 'vitest';
import {
  AssessmentInstance,
  AssessmentSession,
  StudentAnswerSheet,
  QuestionSequence,
  TimerPolicy,
  NavigationPolicy,
  AutosavePolicy,
  RemainingTime,
  ElapsedTime,
  CheckpointVersion,
} from './index';

describe('Assessment Value Objects', () => {
  it('validates RemainingTime and ElapsedTime', () => {
    expect(() => new RemainingTime(-10)).toThrow();
    expect(() => new ElapsedTime(-5)).toThrow();
    expect(new RemainingTime(60000).ms).toBe(60000);
  });

  it('validates CheckpointVersion', () => {
    expect(() => new CheckpointVersion(-1)).toThrow();
    expect(new CheckpointVersion(2).version).toBe(2);
  });
});

describe('AssessmentInstance Aggregate', () => {
  it('instantiates cleanly with policies', () => {
    const seq = new QuestionSequence([
      { questionId: 'q-1', versionId: 'qv-1', orderIndex: 1 },
      { questionId: 'q-2', versionId: 'qv-2', orderIndex: 0 },
    ]);
    const inst = new AssessmentInstance({
      id: 'inst-1',
      questionSequence: seq,
      timerPolicy: new TimerPolicy('Countdown', 3600000),
      navigationPolicy: new NavigationPolicy('Free'),
      autosavePolicy: new AutosavePolicy('Interval', 10000),
      metadata: { title: 'Diagnostic Unit Test' },
    });

    expect(inst.id).toBe('inst-1');
    expect(inst.questionSequence.questions[0].questionId).toBe('q-2'); // Sorted by orderIndex!
    expect(inst.timerPolicy.type).toBe('Countdown');
  });
});

describe('AssessmentSession Lifecycle & State Machine', () => {
  const mkSession = () => {
    const sheet = new StudentAnswerSheet({
      id: 'sheet-1',
      sessionId: 'sess-1',
    });
    return new AssessmentSession({
      id: 'sess-1',
      studentId: 'student-1',
      instanceId: 'inst-1',
      status: 'READY',
      answerSheet: sheet,
    });
  };

  it('progresses session states active -> pause -> resume -> submit', () => {
    const session = mkSession();
    expect(session.status).toBe('READY');

    session.start(new Date());
    expect(session.status).toBe('ACTIVE');

    session.pause(new Date());
    expect(session.status).toBe('PAUSED');

    session.resume(new Date());
    expect(session.status).toBe('RESUMED');

    session.submit({ signature: 'sig-abc', serverId: 'server-1', submittedAt: new Date() });
    expect(session.status).toBe('SUBMITTED');
    expect(session.submission?.receiptChecksum).toBeDefined();
  });

  it('disallows invalid transitions', () => {
    const session = mkSession();
    expect(() => session.pause(new Date())).toThrow();
    session.start(new Date());
    expect(() => session.start(new Date())).toThrow();
  });

  it('blocks answer updates once submitted', () => {
    const session = mkSession();
    session.start(new Date());
    session.submit({ signature: 'sig-abc', serverId: 'server-1', submittedAt: new Date() });

    expect(() =>
      session.saveAnswer({
        questionId: 'q-1',
        questionVersionId: 'qv-1',
        payload: { choice: 'A' },
        state: 'ANSWERED',
        timeSpentMs: 5000,
        recordedAt: new Date(),
      })
    ).toThrow();
  });

  it('records heartbeats and rejects backward clock warnings', () => {
    const session = mkSession();
    session.start(new Date());
    session.recordHeartbeat({
      elapsedTimeMs: 10000,
      activeQuestionId: 'q-1',
      browserVisibility: 'visible',
      networkStatus: 'online',
      recordedAt: new Date(),
    });

    expect(session.heartbeats).toHaveLength(1);

    expect(() =>
      session.recordHeartbeat({
        elapsedTimeMs: 5000, // Backwards!
        activeQuestionId: 'q-1',
        browserVisibility: 'visible',
        networkStatus: 'online',
        recordedAt: new Date(),
      })
    ).toThrow();
  });

  it('records security incidents', () => {
    const session = mkSession();
    session.start(new Date());
    session.recordSecurityIncident({
      incidentType: 'WindowFocusLost',
      payload: { reason: 'User switched window' },
      recordedAt: new Date(),
    });

    expect(session.securityIncidents).toHaveLength(1);
    expect(session.securityIncidents[0].incidentType).toBe('WindowFocusLost');
  });

  it('records revisions for answer updates', () => {
    const session = mkSession();
    session.start(new Date());

    session.saveAnswer({
      questionId: 'q-1',
      questionVersionId: 'qv-1',
      payload: { choice: 'A' },
      state: 'ANSWERED',
      timeSpentMs: 2000,
      recordedAt: new Date(),
    });

    const ans = session.answerSheet.getAnswerForQuestion('qv-1')!;
    expect(ans.payload.choice).toBe('A');
    expect(ans.revisions).toHaveLength(0);

    // Update answer
    session.saveAnswer({
      questionId: 'q-1',
      questionVersionId: 'qv-1',
      payload: { choice: 'B' },
      state: 'ANSWERED',
      timeSpentMs: 3000,
      recordedAt: new Date(),
    });

    expect(ans.payload.choice).toBe('B');
    expect(ans.revisions).toHaveLength(1);
    expect(ans.revisions[0].payload.choice).toBe('A');
  });

  it('supports monotonic checkpoints and offsets', () => {
    const session = mkSession();
    session.start(new Date());

    session.createCheckpoint({
      checkpointVersion: 1,
      activeQuestionId: 'q-1',
      elapsedTimeMs: 12000,
      answersSnapshot: { 'qv-1': { choice: 'A' } },
      checksum: 'check-123',
      recordedAt: new Date(),
    });

    expect(session.checkpoint?.checkpointVersion).toBe(1);

    expect(() =>
      session.createCheckpoint({
        checkpointVersion: 1, // Duplicate or lower version!
        activeQuestionId: 'q-1',
        elapsedTimeMs: 15000,
        answersSnapshot: { 'qv-1': { choice: 'A' } },
        checksum: 'check-123',
        recordedAt: new Date(),
      })
    ).toThrow();
  });
});
