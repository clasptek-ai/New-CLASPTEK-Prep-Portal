import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/learning-resource-errors';

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

export class MimeType extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new DomainError('MIME type cannot be empty.', 'INVALID_MIME_TYPE');
    }
    const sanitized = value.trim();
    if (!/^[a-z0-9.-]+\/[a-z0-9.+-]+$/i.test(sanitized)) {
      throw new DomainError(`Invalid MIME type format: '${value}'`, 'INVALID_MIME_TYPE');
    }
    super({ value: sanitized });
  }

  public get value(): string {
    return this.props.value;
  }
}

export class HashSHA256 extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new DomainError('SHA-256 hash cannot be empty.', 'INVALID_HASH');
    }
    const sanitized = value.trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(sanitized)) {
      throw new DomainError(
        'SHA-256 hash must be a 64-character hexadecimal string.',
        'INVALID_HASH'
      );
    }
    super({ value: sanitized });
  }

  public get value(): string {
    return this.props.value;
  }
}

export type VariantPurposeType =
  | 'standard'
  | 'translation'
  | 'accessible'
  | 'low_bandwidth'
  | 'instructor'
  | 'student'
  | 'print'
  | 'screen'
  | 'custom';
export class VariantPurpose extends ValueObject<{ value: VariantPurposeType }> {
  private static readonly VALID_PURPOSES: VariantPurposeType[] = [
    'standard',
    'translation',
    'accessible',
    'low_bandwidth',
    'instructor',
    'student',
    'print',
    'screen',
    'custom',
  ];

  constructor(value: VariantPurposeType) {
    if (!VariantPurpose.VALID_PURPOSES.includes(value)) {
      throw new DomainError(`Invalid variant purpose: '${value}'`, 'INVALID_VARIANT_PURPOSE');
    }
    super({ value });
  }

  public get value(): VariantPurposeType {
    return this.props.value;
  }
}

export type SensitivityLevelType =
  'normal' | 'internal' | 'instructor_only' | 'restricted' | 'confidential';
export class SensitivityLevel extends ValueObject<{ value: SensitivityLevelType }> {
  private static readonly VALID_LEVELS: SensitivityLevelType[] = [
    'normal',
    'internal',
    'instructor_only',
    'restricted',
    'confidential',
  ];

  constructor(value: SensitivityLevelType) {
    if (!SensitivityLevel.VALID_LEVELS.includes(value)) {
      throw new DomainError(`Invalid sensitivity level: '${value}'`, 'INVALID_SENSITIVITY_LEVEL');
    }
    super({ value });
  }

  public get value(): SensitivityLevelType {
    return this.props.value;
  }
}

export type VisibilityScopeType =
  'private' | 'organization' | 'authenticated' | 'controlled_public';
export class VisibilityScope extends ValueObject<{ value: VisibilityScopeType }> {
  private static readonly VALID_SCOPES: VisibilityScopeType[] = [
    'private',
    'organization',
    'authenticated',
    'controlled_public',
  ];

  constructor(value: VisibilityScopeType) {
    if (!VisibilityScope.VALID_SCOPES.includes(value)) {
      throw new DomainError(`Invalid visibility scope: '${value}'`, 'INVALID_VISIBILITY_SCOPE');
    }
    super({ value });
  }

  public get value(): VisibilityScopeType {
    return this.props.value;
  }
}

export type UploadStatusType =
  'requested' | 'authorised' | 'uploading' | 'uploaded' | 'expired' | 'cancelled' | 'failed';
export class UploadStatus extends ValueObject<{ value: UploadStatusType }> {
  private static readonly VALID_STATUSES: UploadStatusType[] = [
    'requested',
    'authorised',
    'uploading',
    'uploaded',
    'expired',
    'cancelled',
    'failed',
  ];

  constructor(value: UploadStatusType) {
    if (!UploadStatus.VALID_STATUSES.includes(value)) {
      throw new DomainError(`Invalid upload status: '${value}'`, 'INVALID_UPLOAD_STATUS');
    }
    super({ value });
  }

  public get value(): UploadStatusType {
    return this.props.value;
  }
}

export type ResourceStatusType = 'draft' | 'active' | 'archived';
export class ResourceStatus extends ValueObject<{ value: ResourceStatusType }> {
  private static readonly VALID_STATUSES: ResourceStatusType[] = ['draft', 'active', 'archived'];

  constructor(value: ResourceStatusType) {
    if (!ResourceStatus.VALID_STATUSES.includes(value)) {
      throw new DomainError(`Invalid resource status: '${value}'`, 'INVALID_RESOURCE_STATUS');
    }
    super({ value });
  }

  public get value(): ResourceStatusType {
    return this.props.value;
  }
}

export type VersionStatusType =
  | 'draft'
  | 'uploading'
  | 'validating'
  | 'quarantined'
  | 'processing'
  | 'review'
  | 'published'
  | 'retired'
  | 'archived'
  | 'failed';
export class VersionStatus extends ValueObject<{ value: VersionStatusType }> {
  private static readonly VALID_STATUSES: VersionStatusType[] = [
    'draft',
    'uploading',
    'validating',
    'quarantined',
    'processing',
    'review',
    'published',
    'retired',
    'archived',
    'failed',
  ];

  constructor(value: VersionStatusType) {
    if (!VersionStatus.VALID_STATUSES.includes(value)) {
      throw new DomainError(`Invalid version status: '${value}'`, 'INVALID_VERSION_STATUS');
    }
    super({ value });
  }

  public get value(): VersionStatusType {
    return this.props.value;
  }
}
