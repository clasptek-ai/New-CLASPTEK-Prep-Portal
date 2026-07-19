import { ValueObject, Guard, ValidationError } from '@clasptek/kernel';

export class CurriculumCode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    Guard.againstNullOrUndefined(value, 'CurriculumCode');
    Guard.againstEmptyString(value, 'CurriculumCode');
    if (!/^[A-Z0-9_-]{3,100}$/.test(value)) {
      throw new ValidationError('Invalid curriculum code format: must be 3-100 characters, alphanumeric uppercase, hyphens, or underscores.');
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
