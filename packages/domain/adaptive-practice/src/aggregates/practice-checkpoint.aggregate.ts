import { AggregateRoot } from '@clasptek/kernel';

export interface CheckpointDataSnapshot {
  answersSnapshot: Record<string, any>;
  bookmarksSnapshot: string[];
  remainingSeconds: number;
  navigationState: string[];
  reviewFlags: string[];
  wrongAnswerState: string[];
}

export class PracticeCheckpoint extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly sessionId: string,
    public readonly checkpointVersion: number,
    public readonly snapshot: CheckpointDataSnapshot,
    public readonly recordedAt: Date = new Date()
  ) {
    super(id);
  }
}
