import { WrongAnswerQueue, WrongAnswerQueueRepository } from '@clasptek/domain-adaptive-practice';

export class WrongAnswerQueueEngine {
  constructor(private readonly queueRepo?: WrongAnswerQueueRepository) {}

  public async recordWrongAnswer(
    studentId: string,
    questionId: string,
    skillId?: string
  ): Promise<WrongAnswerQueue> {
    let queue = this.queueRepo ? await this.queueRepo.findByStudentId(studentId) : null;
    if (!queue) {
      queue = new WrongAnswerQueue(`waq-${studentId}`, studentId, []);
    }

    queue.addWrongAnswer(questionId, skillId);
    if (this.queueRepo) {
      await this.queueRepo.save(queue);
    }
    return queue;
  }

  public async recordMasteryAttempt(
    studentId: string,
    questionId: string
  ): Promise<{ isResolved: boolean }> {
    const queue = this.queueRepo ? await this.queueRepo.findByStudentId(studentId) : null;
    if (!queue) return { isResolved: false };

    const isResolved = queue.recordMastery(questionId);
    if (this.queueRepo) {
      await this.queueRepo.save(queue);
    }
    return { isResolved };
  }
}
