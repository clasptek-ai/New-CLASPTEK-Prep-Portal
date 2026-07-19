import { AggregateRoot } from '@clasptek/kernel';
import { CurriculumTemplateVersion } from '../entities/curriculum-template-version.entity';

export class CurriculumTemplate extends AggregateRoot<string> {
  public versions: CurriculumTemplateVersion[] = [];

  constructor(
    id: string,
    public code: string,
    public slug: string,
    public name: string,
    public description: string,
    public status: string = 'draft',
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public addVersion(version: CurriculumTemplateVersion): void {
    this.versions.push(version);
  }

  public publishVersion(versionId: string): void {
    const version = this.versions.find(v => v.id === versionId);
    if (!version) {
      throw new Error('Template version not found');
    }
    version.status = 'published';
    this.status = 'published';
    this.updatedAt = new Date();
  }
}
