import { ValueObject, Guard } from '@clasptek/kernel';

export class LessonId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    Guard.againstNullOrUndefined(value, 'LessonId');
    Guard.againstEmptyString(value, 'LessonId');
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
