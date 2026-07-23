import { AggregateRoot } from '@clasptek/kernel';

export type SubjectiveQueueStatus = 'PENDING' | 'ASSIGNED' | 'EVALUATED' | 'FAILED';

export interface SubjectiveQueueItem {
  id: string;
  sessionId: string;
  studentId: string;
  questionId: string;
  sectionType: 'WRITING' | 'SPEAKING';
  submissionPayload: Record<string, any>;
  status: SubjectiveQueueStatus;
  retryCount: number;
  assignedEvaluatorId?: string | undefined;
  evaluatedAt?: Date | undefined;
  evaluationResult?: Record<string, any> | undefined;
}

export class SubjectiveEvaluationQueue extends AggregateRoot<string> {
  private _items = new Map<string, SubjectiveQueueItem>();

  constructor(id: string, items: SubjectiveQueueItem[] = []) {
    super(id);
    for (const item of items) {
      this._items.set(item.id, item);
    }
  }

  public enqueueItem(
    sessionId: string,
    studentId: string,
    questionId: string,
    sectionType: 'WRITING' | 'SPEAKING',
    submissionPayload: Record<string, any>
  ): SubjectiveQueueItem {
    const id = `seq-${sessionId}-${questionId}`;
    const item: SubjectiveQueueItem = {
      id,
      sessionId,
      studentId,
      questionId,
      sectionType,
      submissionPayload,
      status: 'PENDING',
      retryCount: 0,
    };
    this._items.set(id, item);
    return item;
  }

  public assignEvaluator(itemId: string, evaluatorId: string): void {
    const item = this._items.get(itemId);
    if (!item) throw new Error('Queue item not found');
    item.status = 'ASSIGNED';
    item.assignedEvaluatorId = evaluatorId;
  }

  public recordEvaluation(itemId: string, result: Record<string, any>): void {
    const item = this._items.get(itemId);
    if (!item) throw new Error('Queue item not found');
    item.status = 'EVALUATED';
    item.evaluatedAt = new Date();
    item.evaluationResult = result;
  }

  get items(): readonly SubjectiveQueueItem[] {
    return Array.from(this._items.values());
  }

  get pendingItems(): readonly SubjectiveQueueItem[] {
    return Array.from(this._items.values()).filter((i) => i.status === 'PENDING');
  }
}
