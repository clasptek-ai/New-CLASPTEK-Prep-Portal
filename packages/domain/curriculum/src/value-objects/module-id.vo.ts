import { ValueObject, Guard } from '@clasptek/kernel';

export class ModuleId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    Guard.againstNullOrUndefined(value, 'ModuleId');
    Guard.againstEmptyString(value, 'ModuleId');
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
