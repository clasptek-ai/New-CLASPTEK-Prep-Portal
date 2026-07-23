import { AggregateRoot } from '@clasptek/kernel';

export interface WrongAnswerEntry {
  questionId: string;
  skillId?: string;
  masteryCount: number;
  retryCount: number;
  isResolved: boolean;
  lastReviewedAt?: Date;
}

export class WrongAnswerQueue extends AggregateRoot<string> {
  private _entries = new Map<string, WrongAnswerEntry>();
  private _events: any[] = [];

  constructor(
    id: string,
    public readonly studentId: string,
    entries: WrongAnswerEntry[] = []
  ) {
    super(id);
    for (const e of entries) {
      this._entries.set(e.questionId, e);
    }
  }

  public addWrongAnswer(questionId: string, skillId?: string): void {
    const existing = this._entries.get(questionId);
    if (existing) {
      existing.retryCount += 1;
      existing.lastReviewedAt = new Date();
    } else {
      const entry: WrongAnswerEntry = {
        questionId,
        masteryCount: 0,
        retryCount: 1,
        isResolved: false,
        lastReviewedAt: new Date(),
      };
      if (skillId) entry.skillId = skillId;
      this._entries.set(questionId, entry);
    }
  }

  public recordMastery(questionId: string): boolean {
    const entry = this._entries.get(questionId);
    if (!entry) return false;

    entry.masteryCount += 1;
    entry.lastReviewedAt = new Date();
    if (entry.masteryCount >= 2) {
      entry.isResolved = true;
    }
    return entry.isResolved;
  }

  public get entries(): readonly WrongAnswerEntry[] {
    return Array.from(this._entries.values());
  }

  public get activeEntries(): readonly WrongAnswerEntry[] {
    return Array.from(this._entries.values()).filter((e) => !e.isResolved);
  }

  public recordEvent(event: any): void {
    this._events.push(event);
    this.addDomainEvent(event);
  }

  public get emittedEvents(): readonly any[] {
    return this._events;
  }
}
