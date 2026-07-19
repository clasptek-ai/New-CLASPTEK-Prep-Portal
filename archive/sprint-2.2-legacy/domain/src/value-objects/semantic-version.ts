import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/curriculum-errors';

export class SemanticVersion extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || !/^[0-9]+\.[0-9]+\.[0-9]+$/.test(value)) {
      throw new DomainError('Invalid semantic version format');
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
