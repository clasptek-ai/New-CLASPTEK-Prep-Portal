import { MockCheckpoint, CheckpointRepositoryContract } from '@clasptek/domain-mock-examination';

export class PostgresCheckpointRepository implements CheckpointRepositoryContract {
  private checkpoints = new Map<string, MockCheckpoint>();

  public async save(checkpoint: MockCheckpoint): Promise<void> {
    this.checkpoints.set(checkpoint.id, checkpoint);
  }

  public async findLatestBySessionId(sessionId: string): Promise<MockCheckpoint | null> {
    const list = Array.from(this.checkpoints.values()).filter((c) => c.sessionId === sessionId);
    if (list.length === 0) return null;
    list.sort((a, b) => b.checkpointVersion - a.checkpointVersion);
    return list[0];
  }
}
