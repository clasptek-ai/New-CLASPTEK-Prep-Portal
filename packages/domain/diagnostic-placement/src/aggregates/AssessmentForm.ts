import { AggregateRoot } from '@clasptek/kernel';

export interface BlueprintObjective {
  code: string;
  weight: number;
}

export class AssessmentForm extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly catalogId: string,
    public readonly code: string,
    public name: string,
    public description: string,
    public durationMinutes: number = 30,
    public totalQuestions: number = 20,
    public blueprintConfig: { blueprintObjectives: BlueprintObjective[] } = {
      blueprintObjectives: [],
    },
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }
}
