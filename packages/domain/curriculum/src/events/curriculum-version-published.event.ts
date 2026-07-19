export class CurriculumVersionPublishedEvent {
  public readonly timestamp: Date = new Date();
  constructor(
    public readonly curriculumId: string,
    public readonly versionId: string,
    public readonly versionNo: string
  ) {}
}
