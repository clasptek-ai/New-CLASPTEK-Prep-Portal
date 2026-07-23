import {
  AssessmentTimerEvaluationPolicy,
  TimerEvaluationResult,
  AssessmentTimerRepository,
  AssessmentTimerRecord,
} from '@clasptek/domain-assessment-runtime';

export interface TimerSyncResult {
  sessionId: string;
  remainingSeconds: number;
  isExpired: boolean;
  isDriftExceeded: boolean;
  state: 'RUNNING' | 'PAUSED' | 'EXPIRED' | 'AUTO_SUBMITTED';
}

/**
 * ServerTimerEngine
 *
 * Authoritative application server timer engine managing synchronization,
 * heartbeat persistence, drift correction, and auto-submit triggers.
 */
export class ServerTimerEngine {
  private readonly timerPolicy = new AssessmentTimerEvaluationPolicy();
  private timerStore = new Map<string, AssessmentTimerRecord>();

  constructor(public readonly timerRepo?: AssessmentTimerRepository) {}

  public initializeTimer(sessionId: string, allocatedSeconds: number): AssessmentTimerRecord {
    const record: AssessmentTimerRecord = {
      sessionId,
      allocatedSeconds,
      remainingSeconds: allocatedSeconds,
      state: 'RUNNING',
      lastHeartbeatAt: new Date(),
      driftSeconds: 0,
    };
    this.timerStore.set(sessionId, record);
    return record;
  }

  public processHeartbeat(sessionId: string, clientRemainingSeconds: number): TimerSyncResult {
    let record = this.timerStore.get(sessionId);
    if (!record) {
      record = this.initializeTimer(sessionId, 3600);
    }

    const now = new Date();
    const elapsedSinceLastHb = Math.floor(
      (now.getTime() - record.lastHeartbeatAt.getTime()) / 1000
    );
    const expectedRemaining = Math.max(0, record.remainingSeconds - elapsedSinceLastHb);
    const drift = expectedRemaining - clientRemainingSeconds;

    const evalResult: TimerEvaluationResult = this.timerPolicy.evaluateTimer({
      allocatedSeconds: record.allocatedSeconds,
      elapsedSeconds: record.allocatedSeconds - expectedRemaining,
      driftSeconds: drift,
      maxDriftToleranceSeconds: 15,
    });

    record.lastHeartbeatAt = now;
    record.remainingSeconds = evalResult.remainingSeconds;
    record.driftSeconds = drift;

    if (evalResult.isExpired) {
      record.state = 'EXPIRED';
    }

    this.timerStore.set(sessionId, record);

    return {
      sessionId,
      remainingSeconds: record.remainingSeconds,
      isExpired: evalResult.isExpired,
      isDriftExceeded: evalResult.isDriftExceeded,
      state: record.state as any,
    };
  }

  public getTimer(sessionId: string): AssessmentTimerRecord | null {
    return this.timerStore.get(sessionId) || null;
  }
}
