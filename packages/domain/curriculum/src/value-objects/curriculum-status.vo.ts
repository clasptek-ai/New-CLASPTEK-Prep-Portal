import { ValueObject, Guard, ValidationError } from '@clasptek/kernel';

export type AllowedStatuses = 'draft' | 'review' | 'published' | 'retired' | 'archived';

export class CurriculumStatus extends ValueObject<{ value: AllowedStatuses }> {
  private static readonly ALLOWED: AllowedStatuses[] = ['draft', 'review', 'published', 'retired', 'archived'];

  constructor(value: AllowedStatuses) {
    Guard.againstNullOrUndefined(value, 'CurriculumStatus');
    const normalized = String(value).toLowerCase() as AllowedStatuses;
    if (!CurriculumStatus.ALLOWED.includes(normalized)) {
      throw new ValidationError(`Invalid curriculum status: ${value}. Allowed: ${CurriculumStatus.ALLOWED.join(', ')}`);
    }
    super({ value: normalized });
  }

  public get value(): AllowedStatuses {
    return this.props.value;
  }

  public static draft(): CurriculumStatus {
    return new CurriculumStatus('draft');
  }

  public static review(): CurriculumStatus {
    return new CurriculumStatus('review');
  }

  public static published(): CurriculumStatus {
    return new CurriculumStatus('published');
  }

  public static retired(): CurriculumStatus {
    return new CurriculumStatus('retired');
  }

  public static archived(): CurriculumStatus {
    return new CurriculumStatus('archived');
  }
}
