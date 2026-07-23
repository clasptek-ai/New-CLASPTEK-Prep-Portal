import { AggregateRoot } from '@clasptek/kernel';
import { PlacementCalculated } from '../events/DiagnosticEvents';
import { StageName } from '../value-objects/LearningStage';

export class PlacementResult extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly attemptId: string,
    public readonly studentId: string,
    public readonly placementStage: StageName,
    public readonly confidencePercentage: number,
    public readonly reliabilityScore: number,
    public readonly blueprintCoverage: number,
    public readonly difficultyCoverage: number,
    public readonly questionsAnswered: number,
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date()
  ) {
    super(id);
    this.addDomainEvent(
      new PlacementCalculated(id, attemptId, placementStage, confidencePercentage)
    );
  }
}
