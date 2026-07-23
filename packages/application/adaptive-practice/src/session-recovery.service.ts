import { PracticeCheckpoint } from '@clasptek/domain-adaptive-practice';

export interface PracticeRecoverySnapshot {
  sessionId: string;
  answersCount: number;
  bookmarksCount: number;
  remainingSeconds: number;
  lastCheckpointVersion: number;
  recoveredAt: Date;
}

export class SessionRecoveryService {
  private inMemoryCheckpoints = new Map<string, PracticeCheckpoint>();

  public saveCheckpoint(checkpoint: PracticeCheckpoint): void {
    this.inMemoryCheckpoints.set(checkpoint.sessionId, checkpoint);
  }

  public recoverSession(sessionId: string): PracticeRecoverySnapshot | null {
    const cp = this.inMemoryCheckpoints.get(sessionId);
    if (!cp) return null;

    return {
      sessionId,
      answersCount: Object.keys(cp.snapshot.answersSnapshot || {}).length,
      bookmarksCount: cp.snapshot.bookmarksSnapshot.length,
      remainingSeconds: cp.snapshot.remainingSeconds,
      lastCheckpointVersion: cp.checkpointVersion,
      recoveredAt: new Date(),
    };
  }
}
