import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';

export class ExamCode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || !/^[A-Z0-9_-]{3,30}$/.test(value)) {
      throw new DomainError('Invalid exam code format: must be 3-30 chars, alphanumeric with uppercase, hyphen, or underscore.');
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
