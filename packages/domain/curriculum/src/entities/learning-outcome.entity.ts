import { Entity } from '@clasptek/kernel';

export interface OutcomeSkillMapping {
  id: string;
  skillRevisionId: string;
  skillLevelId?: string;
  mappingType: string; // develops, demonstrates, reinforces, integrates, prerequisite
  importanceWeight: number;
  targetMasteryPercentage: number;
  isPrimary: boolean;
}

export interface OutcomeExamComponentMapping {
  id: string;
  officialExamComponentId: string;
  mappingType: string;
  importanceWeight: number;
}

export interface OutcomeBlueprintItemMapping {
  id: string;
  assessmentBlueprintItemId: string;
  mappingType: string;
  importanceWeight: number;
}

export class LearningOutcome extends Entity<string> {
  public skillMappings: OutcomeSkillMapping[] = [];
  public examComponentMappings: OutcomeExamComponentMapping[] = [];
  public blueprintItemMappings: OutcomeBlueprintItemMapping[] = [];

  constructor(
    id: string,
    public readonly curriculumVersionId: string,
    public code: string,
    public statement: string,
    public description: string,
    public outcomeType: string = 'skill', // knowledge, skill, strategy, performance, communication, problem_solving, creation, reflection
    public cognitiveLevelId?: string,
    public difficultyLevelId?: string,
    public evidenceTypeId?: string,
    public minimumMasteryPercentage: number = 80.00,
    public estimatedEvidenceMinutes: number = 0,
    public isMeasurable: boolean = true,
    public status: string = 'draft'
  ) {
    super(id);
  }

  public addSkillMapping(mapping: OutcomeSkillMapping): void {
    this.skillMappings.push(mapping);
  }

  public addExamComponentMapping(mapping: OutcomeExamComponentMapping): void {
    this.examComponentMappings.push(mapping);
  }

  public addBlueprintItemMapping(mapping: OutcomeBlueprintItemMapping): void {
    this.blueprintItemMappings.push(mapping);
  }
}
