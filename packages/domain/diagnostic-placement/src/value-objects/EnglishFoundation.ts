import { ValueObject } from '@clasptek/kernel';

export type FoundationSkill =
  | 'Grammar'
  | 'Reading'
  | 'Writing'
  | 'Listening'
  | 'Speaking';

export class EnglishFoundation extends ValueObject<{ skill: FoundationSkill }> {
  constructor(skill: FoundationSkill) {
    super({ skill });
  }

  get skill(): FoundationSkill {
    return this.props.skill;
  }

  public static values(): FoundationSkill[] {
    return ['Grammar', 'Reading', 'Writing', 'Listening', 'Speaking'];
  }

  public static isValid(value: string): value is FoundationSkill {
    return this.values().includes(value as FoundationSkill);
  }
}
