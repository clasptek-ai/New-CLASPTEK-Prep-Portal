import { LearningResource } from '../aggregates/learning-resource.aggregate';

export interface LearningResourceSearchFilters {
  lessonId?: string;
  resourceType?: string;
  tags?: string[];
  language?: string;
  difficulty?: string;
}

export interface LearningResourceRepository {
  save(resource: LearningResource): Promise<void>;
  findById(id: string): Promise<LearningResource | null>;
  findByCode(code: string): Promise<LearningResource | null>;
  exists(code: string): Promise<boolean>;
  search(filters: LearningResourceSearchFilters): Promise<LearningResource[]>;
  nextIdentity(): string;
}
