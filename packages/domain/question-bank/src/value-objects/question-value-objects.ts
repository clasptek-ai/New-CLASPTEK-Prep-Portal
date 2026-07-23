import { ValueObject } from '@clasptek/kernel';

export class QuestionCode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    super({ value });
    if (!value || value.trim().length === 0) {
      throw new Error('QuestionCode cannot be empty');
    }
  }

  get value(): string {
    return this.props.value;
  }
}

export class SemanticVersion extends ValueObject<{ value: string }> {
  constructor(value: string) {
    super({ value });
    const regex = /^\d+\.\d+\.\d+$/;
    if (!regex.test(value)) {
      throw new Error('Invalid semantic version format. Expected X.Y.Z');
    }
  }

  get value(): string {
    return this.props.value;
  }
}

export class QuestionStatus extends ValueObject<{ value: string }> {
  private static readonly VALID_STATUSES = [
    'draft',
    'under_review',
    'approved',
    'published',
    'deprecated',
    'archived',
  ];

  constructor(value: string) {
    const normalized = value.toLowerCase().trim();
    if (!QuestionStatus.VALID_STATUSES.includes(normalized)) {
      throw new Error(`Invalid QuestionStatus value: ${value}`);
    }
    super({ value: normalized });
  }

  get value(): string {
    return this.props.value;
  }
}
