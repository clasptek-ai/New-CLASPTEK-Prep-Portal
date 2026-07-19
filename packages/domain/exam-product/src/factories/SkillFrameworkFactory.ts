import { randomUUID } from 'crypto';
import { SkillFramework } from '../aggregates/skill-framework.aggregate';

export class SkillFrameworkFactory {
  public static create(code: string, name: string, description?: string): SkillFramework {
    const id = randomUUID();
    return new SkillFramework(id, code, name, description, 'DRAFT');
  }
}
