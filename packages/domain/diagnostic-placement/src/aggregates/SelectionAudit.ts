import { AggregateRoot } from '@clasptek/kernel';
import { SelectionAudited } from '../events/DiagnosticEvents';

export class SelectionAudit extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly attemptId: string | null = null,
    public readonly questionId: string,
    public readonly selectionReason: string,
    public readonly randomSeed: string | null = null,
    public readonly selectedAt: Date = new Date(),
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000'
  ) {
    super(id);
    this.addDomainEvent(new SelectionAudited(id, attemptId || '', questionId));
  }
}
