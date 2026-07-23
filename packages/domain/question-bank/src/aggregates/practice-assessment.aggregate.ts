import { AggregateRoot } from '@clasptek/kernel';

export interface FeedbackConfig {
  mode: 'IMMEDIATE' | 'DELAYED' | 'SUMMARY_ONLY';
  showExplanations: boolean;
  showHints: boolean;
}

export interface TimingConfig {
  hasTimeLimit: boolean;
  timeLimitMinutes?: number;
  perQuestionLimitSeconds?: number;
}

export class PracticeAssessment extends AggregateRoot<string> {
  private _questionIds: string[] = [];

  constructor(
    id: string,
    public readonly code: string,
    public title: string,
    public examProductId: string,
    public skillId: string,
    public feedbackConfig: FeedbackConfig,
    public timingConfig: TimingConfig,
    public questionOrderMode: 'FIXED' | 'RANDOM' = 'RANDOM',
    public status: 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'LOCKED' | 'ARCHIVED' = 'DRAFT',
    public isUnlockedByAdmin: boolean = false,
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public lockVersion: number = 0
  ) {
    super(id);
  }

  public get questionIds(): readonly string[] {
    return this._questionIds;
  }

  public get questionCount(): number {
    return this._questionIds.length;
  }

  public static create(
    id: string,
    code: string,
    title: string,
    examProductId: string,
    skillId: string,
    feedbackConfig: FeedbackConfig,
    timingConfig: TimingConfig,
    questionOrderMode: 'FIXED' | 'RANDOM' = 'RANDOM',
    tenantId?: string
  ): PracticeAssessment {
    return new PracticeAssessment(
      id,
      code,
      title,
      examProductId,
      skillId,
      feedbackConfig,
      timingConfig,
      questionOrderMode,
      'DRAFT',
      false,
      tenantId
    );
  }

  public setQuestionPool(questionIds: string[]): void {
    if (questionIds.length === 0) {
      throw new Error('PracticeAssessment question pool cannot be empty.');
    }
    this._questionIds = [...new Set(questionIds)];
    this.updatedAt = new Date();
  }

  public publish(): void {
    if (this._questionIds.length === 0) {
      throw new Error('Cannot publish PracticeAssessment without questions.');
    }
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();
  }

  public lock(): void {
    this.status = 'LOCKED';
    this.isUnlockedByAdmin = false;
    this.updatedAt = new Date();
  }

  public adminUnlock(): void {
    this.isUnlockedByAdmin = true;
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();
  }

  public archive(): void {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }
}
