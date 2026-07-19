import { AggregateRoot } from '@clasptek/kernel';
import { ModulePrerequisite } from '../entities/module-prerequisite.entity';

export interface ModuleSequence {
  id: string;
  curriculumVersionId: string;
  sourceModuleId: string;
  targetModuleId: string;
  relationType: string; // next, recommended_next, alternative, remediation, advancement, branch
  priority: number;
  isMandatory: boolean;
  conditionJson?: string;
  status: string;
}

export interface ModuleOutcomeMapping {
  id: string;
  learningOutcomeId: string;
  sequenceNo: number;
  isPrimary: boolean;
}

export class LearningModule extends AggregateRoot<string> {
  public prerequisites: ModulePrerequisite[] = [];
  public sequences: ModuleSequence[] = [];
  public outcomes: ModuleOutcomeMapping[] = [];

  constructor(
    id: string,
    public readonly curriculumVersionId: string,
    public code: string,
    public slug: string,
    public name: string,
    public description: string,
    public moduleType: string = 'core', // foundation, core, advanced, mastery, remediation, revision, exam_strategy, project, orientation, custom
    public defaultSequenceNo: number = 1,
    public estimatedStudyMinutes: number = 0,
    public minimumStudyMinutes: number = 0,
    public maximumStudyMinutes: number = 0,
    public isRequired: boolean = true,
    public completionPolicy: string = 'all_activities',
    public status: string = 'draft',
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public addPrerequisite(prereq: ModulePrerequisite): void {
    this.prerequisites.push(prereq);
  }

  public addSequence(seq: ModuleSequence): void {
    this.sequences.push(seq);
  }

  public addOutcome(outcome: ModuleOutcomeMapping): void {
    this.outcomes.push(outcome);
  }
}
