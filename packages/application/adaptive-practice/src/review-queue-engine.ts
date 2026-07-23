import {
  PracticeReviewQueue,
  PracticeReviewQueueRepository,
} from '@clasptek/domain-adaptive-practice';

export class ReviewQueueEngine {
  constructor(private readonly reviewRepo?: PracticeReviewQueueRepository) {}

  public async addToReviewQueue(
    sessionId: string,
    studentId: string,
    questionId: string
  ): Promise<PracticeReviewQueue> {
    let queue = this.reviewRepo ? await this.reviewRepo.findBySessionId(sessionId) : null;
    if (!queue) {
      queue = new PracticeReviewQueue(`prq-${sessionId}`, sessionId, studentId, []);
    }

    queue.addItem(questionId);
    if (this.reviewRepo) {
      await this.reviewRepo.save(queue);
    }
    return queue;
  }

  public async markReviewed(sessionId: string, questionId: string): Promise<void> {
    const queue = this.reviewRepo ? await this.reviewRepo.findBySessionId(sessionId) : null;
    if (queue) {
      queue.markReviewed(questionId);
      if (this.reviewRepo) {
        await this.reviewRepo.save(queue);
      }
    }
  }
}
