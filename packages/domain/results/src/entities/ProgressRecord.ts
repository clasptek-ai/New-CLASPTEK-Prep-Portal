import { Entity } from '@clasptek/kernel';

export class ProgressRecord extends Entity<string> {
  public readonly studentId: string;
  public readonly skillCode: string;
  public readonly latestScore: number | undefined;
  public readonly bestScore: number | undefined;
  public readonly averageScore: number | undefined;
  public readonly attemptCount: number;
  public readonly improvementRate: number;
  public readonly lastActivityAt: Date;

  constructor(props: {
    id: string;
    studentId: string;
    skillCode: string;
    latestScore?: number;
    bestScore?: number;
    averageScore?: number;
    attemptCount?: number;
    improvementRate?: number;
    lastActivityAt?: Date;
  }) {
    super(props.id);
    if (!props.studentId) throw new Error('ProgressRecord studentId cannot be empty');
    if (!props.skillCode) throw new Error('ProgressRecord skillCode cannot be empty');

    this.studentId = props.studentId;
    this.skillCode = props.skillCode;
    this.latestScore = props.latestScore;
    this.bestScore = props.bestScore;
    this.averageScore = props.averageScore;
    this.attemptCount = props.attemptCount ?? 0;
    this.improvementRate = props.improvementRate ?? 0;
    this.lastActivityAt = props.lastActivityAt ?? new Date();
  }
}
