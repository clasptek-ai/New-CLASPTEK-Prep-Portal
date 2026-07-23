import { ValueObject } from '@clasptek/kernel';

export class PracticeAttemptId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('PracticeAttemptId cannot be empty');
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
