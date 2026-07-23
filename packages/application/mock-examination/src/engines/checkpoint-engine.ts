import { MockCheckpoint, CheckpointRepositoryContract } from '@clasptek/domain-mock-examination';

export class CheckpointEngine {
  constructor(private readonly checkpointRepo?: CheckpointRepositoryContract) {}

  public async saveCheckpoint(
    sessionId: string,
    studentId: string,
    version: number,
    snapshot: any
  ): Promise<MockCheckpoint> {
    const cp = MockCheckpoint.createSnapshot(sessionId, studentId, version, snapshot);
    if (this.checkpointRepo) {
      await this.checkpointRepo.save(cp);
    }
    return cp;
  }

  public async restoreCheckpoint(sessionId: string): Promise<MockCheckpoint | null> {
    if (!this.checkpointRepo) return null;
    return this.checkpointRepo.findLatestBySessionId(sessionId);
  }
}
