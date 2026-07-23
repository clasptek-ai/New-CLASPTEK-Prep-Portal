import { AggregateRoot } from '@clasptek/kernel';

export interface PracticeSkillScore {
  skillId: string;
  skillName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface PracticeBookmarkSummary {
  totalBookmarked: number;
  categories: Record<string, number>;
}

export class PracticeResult extends AggregateRoot<string> {
  private _events: any[] = [];

  constructor(
    id: string,
    public readonly sessionId: string,
    public readonly studentId: string,
    public readonly overallScore: number,
    public readonly maxScore: number = 100,
    public readonly accuracyPercentage: number = 0,
    public readonly timeTakenSeconds: number = 0,
    public readonly skillScores: PracticeSkillScore[] = [],
    public readonly practiceRecommendations: string[] = [],
    public readonly bookmarkSummary?: PracticeBookmarkSummary,
    public readonly generatedAt: Date = new Date()
  ) {
    super(id);
  }

  public recordEvent(event: any): void {
    this._events.push(event);
    this.addDomainEvent(event);
  }

  public get emittedEvents(): readonly any[] {
    return this._events;
  }
}
