import { ValueObject, Guard } from '@clasptek/kernel';

export class CurriculumId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    Guard.againstNullOrUndefined(value, 'CurriculumId');
    Guard.againstEmptyString(value, 'CurriculumId');
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
