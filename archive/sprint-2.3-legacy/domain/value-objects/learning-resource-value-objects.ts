import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/learning-resource-errors';

export class LessonCode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new DomainError('Lesson code cannot be empty.', 'INVALID_LESSON_CODE');
    }
    const sanitized = value.trim();
    if (!/^[A-Za-z][A-Za-z0-9_-]{1,49}$/.test(sanitized)) {
      throw new DomainError(
        'Lesson code must be alphanumeric starting with a letter, length 2-50.',
        'INVALID_LESSON_CODE'
      );
    }
    super({ value: sanitized });
  }

  public get value(): string {
    return this.props.value;
  }
}

export class ResourceCode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new DomainError('Resource code cannot be empty.', 'INVALID_RESOURCE_CODE');
    }
    const sanitized = value.trim();
    if (!/^[A-Za-z][A-Za-z0-9_-]{1,49}$/.test(sanitized)) {
      throw new DomainError(
        'Resource code must be alphanumeric starting with a letter, length 2-50.',
        'INVALID_RESOURCE_CODE'
      );
    }
    super({ value: sanitized });
  }

  public get value(): string {
    return this.props.value;
  }
}

export class SemanticVersion extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || typeof value !== 'string') {
      throw new DomainError('Version must be a string.', 'INVALID_VERSION');
    }
    const pattern = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
    if (!pattern.test(value)) {
      throw new DomainError(
        `Version '${value}' does not follow semantic version pattern X.Y.Z.`,
        'INVALID_VERSION'
      );
    }
    super({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
