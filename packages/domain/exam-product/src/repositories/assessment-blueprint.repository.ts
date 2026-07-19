import { AssessmentBlueprint } from '../aggregates/assessment-blueprint.aggregate';

export interface AssessmentBlueprintRepository {
  findById(id: string): Promise<AssessmentBlueprint | null>;
  findByCode(code: string): Promise<AssessmentBlueprint | null>;
  save(blueprint: AssessmentBlueprint): Promise<void>;
  exists(code: string): Promise<boolean>;
}
