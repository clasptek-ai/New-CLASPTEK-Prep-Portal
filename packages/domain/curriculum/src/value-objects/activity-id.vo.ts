import { ValueObject, Guard } from '@clasptek/kernel';

export class ActivityId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    Guard.againstNullOrUndefined(value, 'ActivityId');
    Guard.againstEmptyString(value, 'ActivityId');
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
