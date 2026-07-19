import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';

export class VersionNumber extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || !/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(value)) {
      throw new DomainError(`Invalid semantic version number format: ${value}`);
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
