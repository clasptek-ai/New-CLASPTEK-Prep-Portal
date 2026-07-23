import { AggregateRoot, Entity } from '@clasptek/kernel';
import { DomainError } from '../errors/learning-resource-errors';
import {
  ResourceCode,
  ResourceStatus,
  SensitivityLevel,
  VisibilityScope,
  VariantPurpose,
} from '../value-objects/learning-resource-value-objects';
import {
  LearningResourceCreated,
  ResourceVariantCreated,
  ResourceArchived,
} from '../events/learning-resource-events';

export class ResourceVariant extends Entity<string> {
  constructor(
    id: string,
    public readonly learningResourceId: string,
    public readonly code: string,
    public languageCode: string = 'en',
    public regionCode: string | null = null,
    public accessibilityProfile: string = 'none',
    public variantPurpose: VariantPurpose = new VariantPurpose('standard'),
    public isDefault: boolean = false,
    public currentPublishedVersionId: string | null = null,
    public currentVersionNo: number = 0,
    public status: 'active' | 'inactive' = 'active'
  ) {
    super(id);
  }
}

export class LearningResource extends AggregateRoot<string> {
  private _variants: ResourceVariant[] = [];

  constructor(
    id: string,
    public readonly code: ResourceCode,
    public slug: string,
    public canonicalTitle: string,
    public canonicalDescription: string,
    public resourceTypeId: string,
    public primaryCategoryId: string | null = null,
    public sensitivity: SensitivityLevel = new SensitivityLevel('normal'),
    public visibility: VisibilityScope = new VisibilityScope('authenticated'),
    public ownerOrganizationId: string | null = null,
    public defaultLanguageCode: string = 'en',
    public currentDefaultVariantId: string | null = null,
    public status: ResourceStatus = new ResourceStatus('draft'),
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public get variants(): readonly ResourceVariant[] {
    return this._variants;
  }

  public static create(
    id: string,
    code: ResourceCode,
    slug: string,
    canonicalTitle: string,
    canonicalDescription: string,
    resourceTypeId: string,
    primaryCategoryId: string | null = null,
    sensitivity: SensitivityLevel = new SensitivityLevel('normal'),
    visibility: VisibilityScope = new VisibilityScope('authenticated')
  ): LearningResource {
    const resource = new LearningResource(
      id,
      code,
      slug,
      canonicalTitle,
      canonicalDescription,
      resourceTypeId,
      primaryCategoryId,
      sensitivity,
      visibility,
      null,
      'en',
      null,
      new ResourceStatus('draft')
    );
    resource.addDomainEvent(new LearningResourceCreated(id, code.value, slug));
    return resource;
  }

  public addVariant(
    variantId: string,
    code: string,
    languageCode: string,
    variantPurpose: VariantPurpose,
    isDefault: boolean = false
  ): ResourceVariant {
    if (this.status.value === 'archived') {
      throw new DomainError('Cannot add variants to an archived resource.', 'RESOURCE_ARCHIVED');
    }
    if (this._variants.some((v) => v.code === code)) {
      throw new DomainError(`Variant with code ${code} already exists.`, 'DUPLICATE_VARIANT');
    }

    if (isDefault) {
      for (const v of this._variants) {
        v.isDefault = false;
      }
    }

    const variant = new ResourceVariant(
      variantId,
      this.id,
      code,
      languageCode,
      null,
      'none',
      variantPurpose,
      isDefault
    );

    this._variants.push(variant);
    if (isDefault) {
      this.currentDefaultVariantId = variantId;
    }

    this.addDomainEvent(new ResourceVariantCreated(this.id, variantId, code));
    this.updatedAt = new Date();
    return variant;
  }

  public update(
    title: string,
    description: string,
    sensitivity?: SensitivityLevel,
    visibility?: VisibilityScope
  ) {
    if (this.status.value === 'archived') {
      throw new DomainError('Cannot update details of an archived resource.', 'RESOURCE_ARCHIVED');
    }
    this.canonicalTitle = title;
    this.canonicalDescription = description;
    if (sensitivity) this.sensitivity = sensitivity;
    if (visibility) this.visibility = visibility;
    this.updatedAt = new Date();
  }

  public archive() {
    this.status = new ResourceStatus('archived');
    this.updatedAt = new Date();
    this.addDomainEvent(new ResourceArchived(this.id));
  }

  public restore() {
    this.status = new ResourceStatus('draft');
    this.updatedAt = new Date();
  }

  public setVariants(variants: ResourceVariant[]) {
    this._variants = variants;
  }
}
