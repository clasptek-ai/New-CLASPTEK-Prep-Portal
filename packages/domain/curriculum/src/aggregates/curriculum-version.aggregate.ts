import { AggregateRoot } from '@clasptek/kernel';
import { DependencyLock } from '../entities/dependency-lock.entity';
import { CurriculumLocale } from '../entities/curriculum-locale.entity';
import { Translation } from '../entities/translation.entity';

import { DependencyVersion } from '../value-objects/dependency-version.vo';

export class CurriculumVersion extends AggregateRoot<string> {
  public dependencyLocks: DependencyLock[] = [];
  public locales: CurriculumLocale[] = [];
  public metadata: Map<string, string> = new Map();
  public translations: Translation[] = [];
  public programmeMappings: any[] = [];
  public prerequisites: any[] = [];

  constructor(
    id: string,
    public readonly curriculumId: string,
    public readonly versionNo: DependencyVersion,
    public status: string = 'draft', // draft, review, published, retired
    public name: string = '',
    public description: string = '',
    public effectiveFrom?: Date,
    public effectiveUntil?: Date,
    public supersededBy?: string,
    public breakingChange: boolean = false,
    public migrationNotes?: string,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public addDependencyLock(lock: DependencyLock): void {
    if (this.status === 'published' || this.status === 'retired') {
      throw new Error('Cannot add dependency lock to an immutable version');
    }
    // Remove duplicate dependency lock type
    this.dependencyLocks = this.dependencyLocks.filter(
      l => !(l.dependencyType === lock.dependencyType && l.dependencyId === lock.dependencyId)
    );
    this.dependencyLocks.push(lock);
  }

  public addLocale(locale: CurriculumLocale): void {
    if (locale.isDefault) {
      this.locales.forEach(l => {
        l.isDefault = false;
      });
    }
    this.locales.push(locale);
  }

  public setMeta(key: string, value: string): void {
    this.metadata.set(key, value);
  }

  public addTranslation(translation: Translation): void {
    this.translations.push(translation);
  }

  public submitForReview(): void {
    if (this.status !== 'draft') {
      throw new Error('Can only submit draft for review');
    }
    this.status = 'review';
  }

  public publish(): void {
    if (this.status !== 'review' && this.status !== 'draft') {
      throw new Error('Can only publish from draft or review status');
    }
    this.status = 'published';
    this.effectiveFrom = new Date();
  }

  public retire(): void {
    if (this.status !== 'published') {
      throw new Error('Can only retire a published version');
    }
    this.status = 'retired';
    this.effectiveUntil = new Date();
  }
}
