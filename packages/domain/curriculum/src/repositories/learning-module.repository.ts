import { LearningModule } from '../aggregates/learning-module.aggregate';

export interface LearningModuleRepository {
  findById(id: string): Promise<LearningModule | null>;
  findByVersion(curriculumVersionId: string): Promise<LearningModule[]>;
  save(module: LearningModule): Promise<void>;
  delete(id: string): Promise<void>;
}
