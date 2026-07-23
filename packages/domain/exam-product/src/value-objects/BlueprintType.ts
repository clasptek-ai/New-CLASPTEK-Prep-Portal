import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';

export type AllowedBlueprintTypes =
  'SECTION' | 'SUBSECTION' | 'ITEM_GROUP' | 'DIAGNOSTIC' | 'READINESS' | 'DEFAULT';

export class BlueprintType extends ValueObject<{ value: AllowedBlueprintTypes }> {
  private static readonly ALLOWED_VALUES: AllowedBlueprintTypes[] = [
    'SECTION',
    'SUBSECTION',
    'ITEM_GROUP',
    'DIAGNOSTIC',
    'READINESS',
    'DEFAULT',
  ];

  constructor(value: AllowedBlueprintTypes) {
    if (!BlueprintType.ALLOWED_VALUES.includes(value)) {
      throw new DomainError(`Invalid blueprint type: ${value}`);
    }
    super({ value });
  }

  public get value(): AllowedBlueprintTypes {
    return this.props.value;
  }
}
