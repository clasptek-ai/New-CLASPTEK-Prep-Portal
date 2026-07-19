export class LessonAddedEvent {
  public readonly timestamp: Date = new Date();
  constructor(
    public readonly learningModuleId: string,
    public readonly lessonId: string,
    public readonly code: string
  ) {}
}
