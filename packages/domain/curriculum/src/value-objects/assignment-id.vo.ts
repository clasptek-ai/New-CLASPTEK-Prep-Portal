import { ValueObject, Guard } from '@clasptek/kernel';

export class AssignmentId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    Guard.againstNullOrUndefined(value, 'AssignmentId');
    Guard.againstEmptyString(value, 'AssignmentId');
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
