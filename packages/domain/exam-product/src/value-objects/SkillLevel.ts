import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';

export type AllowedSkillLevels = 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTERY';

export class SkillLevel extends ValueObject<{ value: AllowedSkillLevels }> {
  private static readonly ALLOWED_VALUES: AllowedSkillLevels[] = [
    'FOUNDATION',
    'INTERMEDIATE',
    'ADVANCED',
    'MASTERY',
  ];

  constructor(value: AllowedSkillLevels) {
    if (!SkillLevel.ALLOWED_VALUES.includes(value)) {
      throw new DomainError(`Invalid skill level: ${value}`);
    }
    super({ value });
  }

  public get value(): AllowedSkillLevels {
    return this.props.value;
  }
}
