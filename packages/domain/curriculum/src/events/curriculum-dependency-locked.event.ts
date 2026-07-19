export class CurriculumDependencyLockedEvent {
  public readonly timestamp: Date = new Date();
  constructor(
    public readonly curriculumVersionId: string,
    public readonly dependencyType: string,
    public readonly dependencyId: string,
    public readonly lockedVersionNo: string
  ) {}
}
