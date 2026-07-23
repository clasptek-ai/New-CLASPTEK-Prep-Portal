import { AggregateRoot } from '@clasptek/kernel';
import { SkillProfileGenerated } from '../events/DiagnosticEvents';
import { StageName } from '../value-objects/LearningStage';

export class SkillProfile extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly studentId: string,
    public readonly skillCode: string,
    public masteryPercentage: number,
    public computedStage: StageName,
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    super(id);
  }

  public updateMastery(percentage: number, stage: StageName): void {
    this.masteryPercentage = percentage;
    this.computedStage = stage;
    this.updatedAt = new Date();
    this.addDomainEvent(
      new SkillProfileGenerated(this.id, this.studentId, { [this.skillCode]: percentage })
    );
  }
}
