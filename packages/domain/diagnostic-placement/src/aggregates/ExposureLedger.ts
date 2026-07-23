import { AggregateRoot } from '@clasptek/kernel';
import { ExposureRecorded } from '../events/DiagnosticEvents';

export class ExposureLedger extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly studentId: string,
    public readonly questionId: string,
    public readonly attemptId: string | null = null,
    public readonly renderedAt: Date = new Date(),
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000'
  ) {
    super(id);
    this.addDomainEvent(new ExposureRecorded(id, studentId, questionId));
  }
}
