import { ValueObject, Guard } from '@clasptek/kernel';

export class CurriculumVersionId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    Guard.againstNullOrUndefined(value, 'CurriculumVersionId');
    Guard.againstEmptyString(value, 'CurriculumVersionId');
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
