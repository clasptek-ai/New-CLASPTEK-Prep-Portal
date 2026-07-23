import { RuntimeCheckpoint } from '@clasptek/domain-assessment-runtime';
import type { CheckpointRepository, AnswerSheetRepository } from './index';

export interface RecoverySnapshot {
  sessionId: string;
  answersCount: number;
  remainingSeconds: number;
  lastCheckpointVersion: number;
  recoveredAt: Date;
}

/**
 * SessionRecoveryService
 *
 * Restores session state, answers, timer, and navigation after a browser
 * crash or unexpected page reload using stored runtime checkpoints.
 */
export class SessionRecoveryService {
  constructor(
    private readonly checkpointRepo: CheckpointRepository,
    private readonly answerSheetRepo?: AnswerSheetRepository
  ) {}

  public async recoverSession(
    sessionId: string,
    allocatedSeconds: number = 3600
  ): Promise<RecoverySnapshot | null> {
    const checkpoint: RuntimeCheckpoint | null = await this.checkpointRepo.restore(sessionId);
    if (!checkpoint) return null;

    const sheet = this.answerSheetRepo ? await this.answerSheetRepo.find(sessionId) : null;
    const elapsedSeconds = Math.floor(checkpoint.elapsedTimeMs / 1000);
    const remainingSeconds = Math.max(0, allocatedSeconds - elapsedSeconds);

    return {
      sessionId,
      answersCount: sheet
        ? sheet.answers.length
        : Object.keys(checkpoint.answersSnapshot || {}).length,
      remainingSeconds,
      lastCheckpointVersion: checkpoint.checkpointVersion,
      recoveredAt: new Date(),
    };
  }
}
