import { AggregateRoot } from '@clasptek/kernel';
import { createHash } from 'crypto';
import { QuestionImported, QuestionImportFailed } from '../events/question-events';

export class QuestionImport extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly format: string,
    public status: string = 'pending',
    public totalRecords: number = 0,
    public errorDetails: string | null = null,
    public readonly createdAt: Date = new Date(),
    public lockVersion: number = 0
  ) {
    super(id);
  }

  public static create(id: string, format: string): QuestionImport {
    return new QuestionImport(id, format, 'pending', 0);
  }

  public static computePayloadHash(prompt: string, payload: Record<string, any>): string {
    const raw = prompt + JSON.stringify(payload);
    return createHash('sha256').update(raw).digest('hex');
  }

  public completeImport(totalCount: number): void {
    if (this.status !== 'pending') {
      throw new Error('Import is already finalized');
    }
    this.status = 'imported';
    this.totalRecords = totalCount;
    this.addDomainEvent(new QuestionImported(this.id, totalCount));
  }

  public failImport(error: string): void {
    if (this.status !== 'pending') {
      throw new Error('Import is already finalized');
    }
    this.status = 'failed';
    this.errorDetails = error;
    this.addDomainEvent(new QuestionImportFailed(this.id, error));
  }

  public rollback(): void {
    if (this.status !== 'imported') {
      throw new Error('Can only rollback a successfully imported batch');
    }
    this.status = 'rolled_back';
  }
}
