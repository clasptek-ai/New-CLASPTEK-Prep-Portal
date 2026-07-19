import { ValueObject, ValidationError } from '@clasptek/kernel';

export class SequenceNumber extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value) || value < 0) {
      throw new ValidationError('Sequence number must be a non-negative integer.');
    }
    super({ value });
  }

  public get value(): number {
    return this.props.value;
  }
}
