import { Entity } from '@clasptek/kernel';

export class DependencyLock extends Entity<string> {
  constructor(
    id: string,
    public readonly curriculumVersionId: string,
    public readonly dependencyType: string, // e.g. 'exam_structure', 'blueprint', 'skills_framework'
    public readonly dependencyId: string,
    public readonly lockedVersionNo: string,
    public readonly lockedAt: Date = new Date()
  ) {
    super(id);
  }
}
