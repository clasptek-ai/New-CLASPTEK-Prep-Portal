import { AggregateRoot, Entity } from '@clasptek/kernel';
import {
  QuestionReviewSubmitted,
  QuestionApproved,
  QuestionRejected,
} from '../events/question-events';

export class ReviewComment extends Entity<string> {
  constructor(
    id: string,
    public readonly reviewerId: string,
    public readonly role: string,
    public readonly commentText: string,
    public readonly timestamp: Date = new Date()
  ) {
    super(id);
  }
}

export class QuestionReview extends AggregateRoot<string> {
  public comments: ReviewComment[] = [];

  constructor(
    id: string,
    public readonly questionVersionId: string,
    public stage: string,
    public assignedReviewerId: string,
    public status: string = 'pending',
    public readonly createdAt: Date = new Date(),
    public completedAt: Date | null = null,
    public lockVersion: number = 0
  ) {
    super(id);
  }

  public static create(
    id: string,
    questionVersionId: string,
    stage: string,
    assignedReviewerId: string,
    questionId: string
  ): QuestionReview {
    const review = new QuestionReview(id, questionVersionId, stage, assignedReviewerId, 'pending');
    review.addDomainEvent(new QuestionReviewSubmitted(questionId, id, assignedReviewerId, stage));
    return review;
  }

  public addComment(
    commentId: string,
    reviewerId: string,
    role: string,
    commentText: string
  ): void {
    if (this.status !== 'pending') {
      throw new Error('Cannot add comment to a finalized review');
    }
    this.comments.push(new ReviewComment(commentId, reviewerId, role, commentText));
  }

  public approve(actorId: string, questionId: string): void {
    if (this.status !== 'pending') {
      throw new Error('Review is already finalized');
    }
    this.status = 'approved';
    this.completedAt = new Date();
    this.addDomainEvent(new QuestionApproved(questionId, actorId, this.stage));
  }

  public reject(actorId: string, commentText: string, questionId: string): void {
    if (this.status !== 'pending') {
      throw new Error('Review is already finalized');
    }
    this.status = 'rejected';
    this.completedAt = new Date();
    this.addDomainEvent(new QuestionRejected(questionId, actorId, commentText));
  }
}
