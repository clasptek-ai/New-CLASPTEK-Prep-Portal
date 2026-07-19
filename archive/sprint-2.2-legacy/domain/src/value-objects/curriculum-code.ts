import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/curriculum-errors';

export class CurriculumCode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || !/^[A-Z0-9_-]{3,30}$/.test(value)) {
      throw new DomainError('Invalid curriculum code format');
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
