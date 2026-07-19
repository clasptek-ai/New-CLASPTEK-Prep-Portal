import { ValueObject, Guard } from '@clasptek/kernel';

export class OutcomeId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    Guard.againstNullOrUndefined(value, 'OutcomeId');
    Guard.againstEmptyString(value, 'OutcomeId');
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
