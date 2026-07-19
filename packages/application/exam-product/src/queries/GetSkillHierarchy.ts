import { Result } from '@clasptek/kernel';
import { SkillHierarchyReadModel } from '../read-models/SkillHierarchyReadModel';

export interface SkillHierarchyReadService {
  getSkillHierarchy(frameworkVersionId: string): Promise<SkillHierarchyReadModel[]>;
}

export class GetSkillHierarchyHandler {
  constructor(private readonly readService: SkillHierarchyReadService) {}

  public async execute(frameworkVersionId: string): Promise<Result<SkillHierarchyReadModel[], Error>> {
    try {
      const results = await this.readService.getSkillHierarchy(frameworkVersionId);
      return Result.success(results);
    } catch (err: any) {
      return Result.failure(err);
    }
  }
}
