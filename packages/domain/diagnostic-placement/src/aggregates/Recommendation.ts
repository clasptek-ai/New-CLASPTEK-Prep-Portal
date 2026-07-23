import { AggregateRoot } from '@clasptek/kernel';
import { RecommendationsGenerated } from '../events/DiagnosticEvents';

export class Recommendation extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly placementResultId: string,
    public readonly studentId: string,
    public readonly recommendedLearningPathId: string,
    public readonly priority: number = 1,
    public readonly title: string,
    public readonly description: string | null = null,
    public status: 'ACTIVE' | 'COMPLETED' | 'DISMISSED' = 'ACTIVE',
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date()
  ) {
    super(id);
    this.addDomainEvent(new RecommendationsGenerated(studentId, recommendedLearningPathId));
  }

  public complete(): void {
    this.status = 'COMPLETED';
  }

  public dismiss(): void {
    this.status = 'DISMISSED';
  }
}
