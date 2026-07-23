import { AggregateRoot } from '@clasptek/kernel';
import { DiagnosticCreated } from '../events/DiagnosticEvents';

export class DiagnosticCatalog extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly examProductId: string,
    public readonly code: string,
    public name: string,
    public description: string,
    public status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' = 'DRAFT',
    public versionNo: number = 1,
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public publish(): void {
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();
    this.addDomainEvent(new DiagnosticCreated(this.id, this.code));
  }
}
