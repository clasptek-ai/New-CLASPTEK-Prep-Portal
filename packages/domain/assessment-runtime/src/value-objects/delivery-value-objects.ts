import { ValueObject } from '@clasptek/kernel';

export class AssessmentAttemptId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('AssessmentAttemptId cannot be empty');
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}

export type TimerStateValue = 'RUNNING' | 'PAUSED' | 'EXPIRED' | 'AUTO_SUBMITTED';

export class TimerState extends ValueObject<{ value: TimerStateValue }> {
  constructor(value: TimerStateValue) {
    const valid: TimerStateValue[] = ['RUNNING', 'PAUSED', 'EXPIRED', 'AUTO_SUBMITTED'];
    if (!valid.includes(value)) {
      throw new Error(`Invalid TimerState '${value}'. Valid: ${valid.join(', ')}`);
    }
    super({ value });
  }

  public get value(): TimerStateValue {
    return this.props.value;
  }
}
