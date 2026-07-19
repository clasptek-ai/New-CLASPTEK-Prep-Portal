import { Entity } from '@clasptek/kernel';
import { Course } from './course.entity';
import { SemanticVersion } from '../value-objects/semantic-version';

export class ProgrammeVersion extends Entity<string> {
  public versionNo: SemanticVersion;
  public status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED';
  public name: string;
  public description?: string;
  public effectiveFrom?: Date;
  public effectiveUntil?: Date;
  public supersededBy?: string;
  public breakingChange: boolean = false;
  public migrationNotes?: string;
  public lockVersion: number = 0;
  public courses: Course[] = [];

  constructor(
    id: string,
    public readonly programmeId: string,
    versionNo: SemanticVersion,
    status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED',
    name: string
  ) {
    super(id);
    this.versionNo = versionNo;
    this.status = status;
    this.name = name;
  }
}
