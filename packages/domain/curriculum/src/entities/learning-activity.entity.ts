import { Entity } from '@clasptek/kernel';

export interface ActivityOutcomeMapping {
  id: string;
  learningOutcomeId: string;
  mappingType: string;
  importanceWeight: number;
}

export class LearningActivity extends Entity<string> {
  public outcomes: ActivityOutcomeMapping[] = [];
  public resourceReferences: string[] = []; // resource_reference_ids

  constructor(
    id: string,
    public readonly lessonId: string,
    public activityTypeId: string,
    public code: string,
    public title: string,
    public instructions: string,
    public sequenceNo: number = 1,
    public estimatedMinutes: number = 0,
    public deliveryMode: string = 'self_paced', // self_paced, instructor_led, etc.
    public interactionMode: string = 'individual', // individual, pair, group, peer_review
    public evidenceTypeId?: string,
    public difficultyLevelId?: string,
    public cognitiveLevelId?: string,
    public isRequired: boolean = true,
    public completionDefinitionJson?: string,
    public status: string = 'draft'
  ) {
    super(id);
  }

  public addOutcome(mapping: ActivityOutcomeMapping): void {
    this.outcomes.push(mapping);
  }

  public associateResource(resourceId: string): void {
    this.resourceReferences.push(resourceId);
  }
}
