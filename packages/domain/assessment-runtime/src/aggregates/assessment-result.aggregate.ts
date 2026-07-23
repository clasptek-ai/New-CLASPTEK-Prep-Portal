import { AggregateRoot } from '@clasptek/kernel';

export interface SectionScore {
  sectionCode: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
}

export interface SkillScore {
  skillId: string;
  skillName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface PracticeRecommendationPayload {
  recommendedSkillIds: string[];
  recommendedModules: string[];
  rationale: string;
}

export type VisibilityMode = 'SCORE_ONLY' | 'SCORE_SECTIONS' | 'SCORE_CORRECT' | 'FULL_REVIEW';

export class AssessmentResult extends AggregateRoot<string> {
  private _events: any[] = [];

  constructor(
    id: string,
    public readonly sessionId: string,
    public readonly studentId: string,
    public readonly overallScore: number,
    public readonly maxScore: number = 100,
    public readonly isPassed: boolean,
    public visibilityMode: VisibilityMode = 'FULL_REVIEW',
    public readonly sectionScores: SectionScore[] = [],
    public readonly skillScores: SkillScore[] = [],
    public readonly practiceRecommendation?: PracticeRecommendationPayload | undefined,
    public readonly timeTakenSeconds: number = 0,
    public readonly generatedAt: Date = new Date(),
    public readonly attemptId?: string | undefined
  ) {
    super(id);
  }

  public setVisibilityMode(mode: VisibilityMode): void {
    this.visibilityMode = mode;
  }

  public recordEvent(event: any): void {
    this._events.push(event);
    this.addDomainEvent(event);
  }

  public get emittedEvents(): readonly any[] {
    return this._events;
  }
}
