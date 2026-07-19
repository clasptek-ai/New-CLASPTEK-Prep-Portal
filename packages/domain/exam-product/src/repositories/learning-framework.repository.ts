import { LearningFramework } from '../aggregates/learning-framework.aggregate';

export interface LearningFrameworkRepository {
  findById(id: string): Promise<LearningFramework | null>;
  findByCode(code: string): Promise<LearningFramework | null>;
  save(framework: LearningFramework): Promise<void>;
  exists(code: string): Promise<boolean>;
}
