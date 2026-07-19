import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';

export class SkillCode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || !/^[A-Z0-9_-]{3,50}$/.test(value)) {
      throw new DomainError(`Invalid skill code format: ${value}`);
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
