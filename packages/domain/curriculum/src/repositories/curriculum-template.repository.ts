import { CurriculumTemplate } from '../aggregates/curriculum-template.aggregate';

export interface CurriculumTemplateRepository {
  findById(id: string): Promise<CurriculumTemplate | null>;
  findByCode(code: string): Promise<CurriculumTemplate | null>;
  save(template: CurriculumTemplate): Promise<void>;
  delete(id: string): Promise<void>;
}
