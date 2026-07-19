export class CurriculumCreatedEvent {
  public readonly timestamp: Date = new Date();
  constructor(
    public readonly curriculumId: string,
    public readonly code: string,
    public readonly name: string
  ) {}
}
