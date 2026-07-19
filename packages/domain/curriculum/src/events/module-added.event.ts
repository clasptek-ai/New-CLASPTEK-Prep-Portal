export class ModuleAddedEvent {
  public readonly timestamp: Date = new Date();
  constructor(
    public readonly curriculumVersionId: string,
    public readonly moduleId: string,
    public readonly code: string
  ) {}
}
