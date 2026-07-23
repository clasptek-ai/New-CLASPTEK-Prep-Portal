import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';

export type AllowedStatuses =
  'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED';

export class ExamProductStatus extends ValueObject<{ value: AllowedStatuses }> {
  private static readonly ALLOWED_VALUES: AllowedStatuses[] = [
    'DRAFT',
    'UNDER_REVIEW',
    'APPROVED',
    'PUBLISHED',
    'DEPRECATED',
    'ARCHIVED',
  ];

  constructor(value: AllowedStatuses) {
    if (!ExamProductStatus.ALLOWED_VALUES.includes(value)) {
      throw new DomainError(`Invalid exam product status: ${value}`);
    }
    super({ value });
  }

  public get value(): AllowedStatuses {
    return this.props.value;
  }
}
