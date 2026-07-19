import { Entity } from '@clasptek/kernel';

export interface AssignmentOutcomeMapping {
  id: string;
  learningOutcomeId: string;
  mappingType: string;
  importanceWeight: number;
}

export class LearningAssignment extends Entity<string> {
  public outcomes: AssignmentOutcomeMapping[] = [];
  public resourceReferences: string[] = []; // resource_reference_ids

  constructor(
    id: string,
    public readonly lessonId: string,
    public code: string,
    public title: string,
    public description: string,
    public instructions: string,
    public assignmentType: string = 'written_task',
    public submissionMode: string = 'file',
    public evidenceTypeId?: string,
    public difficultyLevelId?: string,
    public cognitiveLevelId?: string,
    public estimatedCompletionMinutes: number = 0,
    public recommendedRubricReference?: string,
    public isRequired: boolean = true,
    public allowCollaboration: boolean = false,
    public status: string = 'draft'
  ) {
    super(id);
  }

  public addOutcome(mapping: AssignmentOutcomeMapping): void {
    this.outcomes.push(mapping);
  }

  public associateResource(resourceId: string): void {
    this.resourceReferences.push(resourceId);
  }
}
