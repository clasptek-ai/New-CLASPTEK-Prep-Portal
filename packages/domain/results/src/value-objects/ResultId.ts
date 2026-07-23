import { ValueObject } from '@clasptek/kernel';

export class ResultId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value) throw new Error('ResultId cannot be empty');
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
