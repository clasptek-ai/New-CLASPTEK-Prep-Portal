import { ValueObject, Guard, ValidationError } from '@clasptek/kernel';

export class DependencyVersion extends ValueObject<{ value: string }> {
  constructor(value: string) {
    Guard.againstNullOrUndefined(value, 'DependencyVersion');
    Guard.againstEmptyString(value, 'DependencyVersion');
    if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(value)) {
      throw new ValidationError(
        `Invalid dependency version format: "${value}". Must be a valid semantic version (e.g. 1.0.0).`
      );
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
