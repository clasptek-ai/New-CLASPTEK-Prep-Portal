import { ValueObject, ValidationError } from '@clasptek/kernel';

export class MasteryPercentage extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (typeof value !== 'number' || isNaN(value) || value < 0.0 || value > 100.0) {
      throw new ValidationError('Mastery percentage must be a number between 0.00 and 100.00.');
    }
    super({ value });
  }

  public get value(): number {
    return this.props.value;
  }
}
