import { Entity } from '@clasptek/kernel';
import { ResultType } from '../value-objects/ResultType';
import { ProgressScore } from '../value-objects/ProgressScore';

export class StudentResult extends Entity<string> {
  public readonly studentId: string;
  public readonly resultType: ResultType;
  public readonly sourceId: string;
  public readonly title: string;
  public readonly score: ProgressScore | undefined;
  public readonly bandScore: string | undefined;
  public readonly isPassing: boolean | undefined;
  public readonly summaryFeedback: string | undefined;
  public readonly details: Record<string, any>;
  public readonly publishedAt: Date;

  constructor(props: {
    id: string;
    studentId: string;
    resultType: ResultType;
    sourceId: string;
    title: string;
    score?: ProgressScore;
    bandScore?: string;
    isPassing?: boolean;
    summaryFeedback?: string;
    details?: Record<string, any>;
    publishedAt?: Date;
  }) {
    super(props.id);
    if (!props.studentId) throw new Error('StudentResult studentId cannot be empty');
    if (!props.sourceId) throw new Error('StudentResult sourceId cannot be empty');
    if (!props.title) throw new Error('StudentResult title cannot be empty');

    this.studentId = props.studentId;
    this.resultType = props.resultType;
    this.sourceId = props.sourceId;
    this.title = props.title;
    this.score = props.score;
    this.bandScore = props.bandScore;
    this.isPassing = props.isPassing;
    this.summaryFeedback = props.summaryFeedback;
    this.details = Object.freeze({ ...(props.details ?? {}) });
    this.publishedAt = props.publishedAt ?? new Date();
  }
}
