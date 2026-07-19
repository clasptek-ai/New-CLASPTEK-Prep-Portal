import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';

export type AllowedReadinessLevels = 'NOT_READY' | 'DEVELOPING' | 'READY' | 'TARGET_ACHIEVED';

export class ReadinessLevel extends ValueObject<{ value: AllowedReadinessLevels }> {
  private static readonly ALLOWED_VALUES: AllowedReadinessLevels[] = [
    'NOT_READY',
    'DEVELOPING',
    'READY',
    'TARGET_ACHIEVED',
  ];

  constructor(value: AllowedReadinessLevels) {
    if (!ReadinessLevel.ALLOWED_VALUES.includes(value)) {
      throw new DomainError(`Invalid readiness level: ${value}`);
    }
    super({ value });
  }

  public get value(): AllowedReadinessLevels {
    return this.props.value;
  }
}
