export class LearningOutcomeAddedEvent {
  public readonly timestamp: Date = new Date();
  constructor(
    public readonly curriculumVersionId: string,
    public readonly outcomeId: string,
    public readonly code: string
  ) {}
}
