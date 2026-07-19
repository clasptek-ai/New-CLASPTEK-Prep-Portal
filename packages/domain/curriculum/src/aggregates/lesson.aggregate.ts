import { AggregateRoot } from '@clasptek/kernel';
import { LessonPrerequisite } from '../entities/lesson-prerequisite.entity';

export interface LessonSequence {
  id: string;
  learningModuleId: string;
  sourceLessonId: string;
  targetLessonId: string;
  relationType: string; // next, recommended_next, alternative, remediation, advancement, branch
  priority: number;
  isMandatory: boolean;
  conditionJson?: string;
  status: string;
}

export interface LessonOutcomeMapping {
  id: string;
  learningOutcomeId: string;
  sequenceNo: number;
  isPrimary: boolean;
}

export interface LessonResourceMapping {
  id: string;
  resourceReferenceId: string;
  usageType: string;
  sequenceNo: number;
  isRequired: boolean;
  availabilityPolicy: string;
}

export class Lesson extends AggregateRoot<string> {
  public prerequisites: LessonPrerequisite[] = [];
  public sequences: LessonSequence[] = [];
  public outcomes: LessonOutcomeMapping[] = [];
  public resources: LessonResourceMapping[] = [];

  constructor(
    id: string,
    public readonly learningModuleId: string,
    public code: string,
    public slug: string,
    public title: string,
    public summary: string,
    public lessonType: string = 'concept',
    public defaultSequenceNo: number = 1,
    public estimatedStudyMinutes: number = 0,
    public minimumStudyMinutes: number = 0,
    public maximumStudyMinutes: number = 0,
    public instructionalMethod: string = 'text_audio',
    public completionPolicy: string = 'all_activities',
    public isRequired: boolean = true,
    public status: string = 'draft',
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null,
    // Compatibility fields
    public moduleId?: string,
    public name?: string,
    public description?: string,
    public displayOrder?: number
  ) {
    super(id);
    this.moduleId = this.moduleId || learningModuleId;
    this.name = this.name || title;
    this.description = this.description || summary;
    this.displayOrder = this.displayOrder || defaultSequenceNo;
  }

  public addPrerequisite(prereq: LessonPrerequisite): void {
    this.prerequisites.push(prereq);
  }

  public addSequence(seq: LessonSequence): void {
    this.sequences.push(seq);
  }

  public addOutcome(outcome: LessonOutcomeMapping): void {
    this.outcomes.push(outcome);
  }

  public addResource(resource: LessonResourceMapping): void {
    this.resources.push(resource);
  }
}
