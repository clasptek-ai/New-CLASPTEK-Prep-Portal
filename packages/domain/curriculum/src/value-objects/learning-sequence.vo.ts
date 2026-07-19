import { ValueObject, Guard } from '@clasptek/kernel';

export class LearningSequence extends ValueObject<{ value: string }> {
  constructor(value: string) {
    Guard.againstNullOrUndefined(value, 'LearningSequence');
    Guard.againstEmptyString(value, 'LearningSequence');
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
