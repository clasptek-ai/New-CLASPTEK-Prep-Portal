import { AggregateRoot } from '@clasptek/kernel';

export interface MockCheckpointSnapshot {
  answers: Record<string, any>;
  timeRemainingSeconds: number;
  currentSectionIndex: number;
  flaggedQuestions: string[];
  warningCount: number;
}

export class MockCheckpoint extends AggregateRoot<string> {
  public readonly sessionId: string;
  public readonly studentId: string;
  public readonly checkpointVersion: number;
  public readonly snapshot: MockCheckpointSnapshot;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    sessionId: string;
    studentId: string;
    checkpointVersion: number;
    snapshot: MockCheckpointSnapshot;
    recordedAt?: Date | undefined;
  }) {
    super(props.id);
    this.sessionId = props.sessionId;
    this.studentId = props.studentId;
    this.checkpointVersion = props.checkpointVersion;
    this.snapshot = props.snapshot;
    this.recordedAt = props.recordedAt ?? new Date();
  }

  public static createSnapshot(
    sessionId: string,
    studentId: string,
    version: number,
    snapshot: MockCheckpointSnapshot
  ): MockCheckpoint {
    return new MockCheckpoint({
      id: `cp-${sessionId}-${version}`,
      sessionId,
      studentId,
      checkpointVersion: version,
      snapshot,
    });
  }
}
