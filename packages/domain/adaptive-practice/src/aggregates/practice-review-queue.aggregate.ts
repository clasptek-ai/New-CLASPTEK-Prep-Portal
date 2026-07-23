import { AggregateRoot } from '@clasptek/kernel';

export interface ReviewQueueItem {
  questionId: string;
  isReviewed: boolean;
  orderIndex: number;
}

export class PracticeReviewQueue extends AggregateRoot<string> {
  private _items: ReviewQueueItem[] = [];
  private _events: any[] = [];

  constructor(
    id: string,
    public readonly sessionId: string,
    public readonly studentId: string,
    items: ReviewQueueItem[] = []
  ) {
    super(id);
    this._items = [...items];
  }

  public addItem(questionId: string): void {
    if (!this._items.some((i) => i.questionId === questionId)) {
      this._items.push({
        questionId,
        isReviewed: false,
        orderIndex: this._items.length + 1,
      });
    }
  }

  public markReviewed(questionId: string): void {
    const item = this._items.find((i) => i.questionId === questionId);
    if (item) {
      item.isReviewed = true;
    }
  }

  public get items(): readonly ReviewQueueItem[] {
    return this._items;
  }

  public get unreviewedItems(): readonly ReviewQueueItem[] {
    return this._items.filter((i) => !i.isReviewed);
  }

  public recordEvent(event: any): void {
    this._events.push(event);
    this.addDomainEvent(event);
  }

  public get emittedEvents(): readonly any[] {
    return this._events;
  }
}
