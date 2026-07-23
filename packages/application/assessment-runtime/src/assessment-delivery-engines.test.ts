import { describe, it, expect, beforeEach } from 'vitest';
import {
  ResultGenerationService,
  ServerTimerEngine,
  ExaminationRulesEngine,
  ExaminationIntegrityEngine,
  SessionRecoveryService,
} from './index';

describe('Sprint 3.4.1 Application Services — ResultGenerationService', () => {
  it('generates result, persists, and emits ResultGenerated domain event', async () => {
    const mockRepo = {
      save: async () => {},
      findBySessionId: async () => null,
      findByStudentId: async () => [],
    };
    const service = new ResultGenerationService(mockRepo);

    const result = await service.generateResult({
      sessionId: 'ses-101',
      studentId: 'std-202',
      studentAnswers: [
        {
          questionId: 'q1',
          sectionCode: 'READING',
          selectedOptionIds: ['opt-1'],
          correctOptionIds: ['opt-1'],
          points: 10,
        },
      ],
      visibilityMode: 'FULL_REVIEW',
    });

    expect(result.overallScore).toBe(10);
    expect(result.isPassed).toBe(true);
    expect(result.emittedEvents.length).toBeGreaterThan(0);
  });
});

describe('Sprint 3.4.1 Application Services — ServerTimerEngine', () => {
  let timerEngine: ServerTimerEngine;

  beforeEach(() => {
    timerEngine = new ServerTimerEngine();
  });

  it('initializes and synchronizes countdown heartbeats with drift calculation', () => {
    timerEngine.initializeTimer('ses-timer-1', 3600);
    const sync = timerEngine.processHeartbeat('ses-timer-1', 3590);

    expect(sync.sessionId).toBe('ses-timer-1');
    expect(sync.isExpired).toBe(false);
  });
});

describe('Sprint 3.4.1 Application Services — ExaminationRulesEngine', () => {
  it('validates state transitions, section locking, and attempt limits', () => {
    const rules = new ExaminationRulesEngine();

    expect(rules.validateTransition('STARTED', 'PAUSED').allowed).toBe(true);
    expect(rules.validateTransition('CREATED', 'SUBMITTED').allowed).toBe(false);

    expect(rules.validateSectionAccess(['LISTENING'], 'LISTENING').allowed).toBe(false);
    expect(rules.validateSectionAccess(['LISTENING'], 'READING').allowed).toBe(true);

    expect(rules.validateAttemptCount(4, 3).allowed).toBe(false);
  });
});

describe('Sprint 3.4.1 Application Services — ExaminationIntegrityEngine', () => {
  let integrity: ExaminationIntegrityEngine;

  beforeEach(() => {
    integrity = new ExaminationIntegrityEngine();
  });

  it('enforces single active session per student and detects conflicts', () => {
    const res1 = integrity.registerSession('ses-1', 'std-100');
    expect(res1.hasActiveConflict).toBe(false);

    const res2 = integrity.registerSession('ses-2', 'std-100');
    expect(res2.hasActiveConflict).toBe(true);
    expect(res2.incidentType).toBe('DUPLICATE_SESSION');

    integrity.terminateSession('std-100');
    const res3 = integrity.registerSession('ses-2', 'std-100');
    expect(res3.hasActiveConflict).toBe(false);
  });
});

describe('Sprint 3.4.1 Application Services — SessionRecoveryService', () => {
  it('restores snapshot from runtime checkpoint', async () => {
    const mockCheckpointRepo = {
      save: async () => {},
      restore: async () =>
        ({
          sessionId: 'ses-rec-1',
          checkpointVersion: 3,
          elapsedTimeMs: 1800000,
          answersSnapshot: {},
        }) as any,
      deleteExpired: async () => {},
    };

    const recoveryService = new SessionRecoveryService(mockCheckpointRepo);
    const snapshot = await recoveryService.recoverSession('ses-rec-1', 3600);

    expect(snapshot).not.toBeNull();
    expect(snapshot?.lastCheckpointVersion).toBe(3);
    expect(snapshot?.remainingSeconds).toBe(1800);
  });
});
