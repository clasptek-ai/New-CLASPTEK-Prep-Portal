import { AggregateRoot } from '@clasptek/kernel';

export interface QueueItem {
  id: string;
  jobId: string;
  studentId: string;
  priority: number;
  source: 'ASSESSMENT' | 'PRACTICE' | 'MOCK';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'DLQ';
  retryCount: number;
}

export class EvaluationQueue extends AggregateRoot<string> {
  private _items = new Map<string, QueueItem>();

  constructor(id: string, items: QueueItem[] = []) {
    super(id);
    for (const item of items) {
      this._items.set(item.id, item);
    }
  }

  get items(): readonly QueueItem[] {
    return Array.from(this._items.values());
  }

  public enqueue(
    jobId: string,
    studentId: string,
    priority: number,
    source: 'ASSESSMENT' | 'PRACTICE' | 'MOCK'
  ): QueueItem {
    const id = `qi-${jobId}`;
    const item: QueueItem = {
      id,
      jobId,
      studentId,
      priority,
      source,
      status: 'QUEUED',
      retryCount: 0,
    };
    this._items.set(id, item);
    return item;
  }

  public dequeue(itemId: string): void {
    const item = this._items.get(itemId);
    if (!item) throw new Error('Queue item not found');
    item.status = 'RUNNING';
  }

  public markCompleted(itemId: string): void {
    const item = this._items.get(itemId);
    if (!item) throw new Error('Queue item not found');
    item.status = 'COMPLETED';
  }

  public markFailed(itemId: string, maxRetries: number = 3): boolean {
    const item = this._items.get(itemId);
    if (!item) throw new Error('Queue item not found');
    item.retryCount += 1;
    if (item.retryCount >= maxRetries) {
      item.status = 'DLQ';
      return false; // routed to Dead-Letter Queue
    } else {
      item.status = 'QUEUED';
      return true; // retried
    }
  }
}
