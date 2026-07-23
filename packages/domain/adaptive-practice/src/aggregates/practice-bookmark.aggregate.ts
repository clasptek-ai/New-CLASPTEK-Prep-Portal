import { AggregateRoot } from '@clasptek/kernel';

export class PracticeBookmark extends AggregateRoot<string> {
  private _events: any[] = [];

  constructor(
    id: string,
    public readonly studentId: string,
    public readonly questionId: string,
    public category: string = 'GENERAL',
    public notes?: string,
    public readonly createdAt: Date = new Date()
  ) {
    super(id);
  }

  public updateNotes(notes: string): void {
    this.notes = notes;
  }

  public recordEvent(event: any): void {
    this._events.push(event);
    this.addDomainEvent(event);
  }

  public get emittedEvents(): readonly any[] {
    return this._events;
  }
}
