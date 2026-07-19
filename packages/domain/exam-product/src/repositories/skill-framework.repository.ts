import { SkillFramework } from '../aggregates/skill-framework.aggregate';

export interface SkillFrameworkRepository {
  findById(id: string): Promise<SkillFramework | null>;
  findByCode(code: string): Promise<SkillFramework | null>;
  save(framework: SkillFramework): Promise<void>;
  exists(code: string): Promise<boolean>;
}
