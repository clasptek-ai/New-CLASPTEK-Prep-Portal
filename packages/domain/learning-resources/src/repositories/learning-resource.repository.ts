import { LearningResource } from '../aggregates/learning-resource.aggregate';

export interface LearningResourceRepository {
  save(resource: LearningResource): Promise<void>;
  findById(id: string): Promise<LearningResource | null>;
  findByCode(code: string): Promise<LearningResource | null>;
  exists(code: string): Promise<boolean>;
  nextIdentity(): string;
}
