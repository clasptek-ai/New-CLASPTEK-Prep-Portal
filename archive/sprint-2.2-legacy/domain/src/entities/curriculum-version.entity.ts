import { Entity } from '@clasptek/kernel';
import { SemanticVersion } from '../value-objects/semantic-version';

export interface CurriculumProgrammeMapping {
  programmeId: string;
  programmeVersionId: string;
  displayOrder: number;
}

export interface Prerequisite {
  sourceKind: 'Programme' | 'Course' | 'Subject' | 'Module' | 'Competency';
  sourceId: string;
  targetKind: 'Programme' | 'Course' | 'Subject' | 'Module' | 'Competency';
  targetId: string;
  prerequisiteType: 'REQUIRED' | 'RECOMMENDED';
}

export class CurriculumVersion extends Entity<string> {
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

  public programmeMappings: CurriculumProgrammeMapping[] = [];
  public prerequisites: Prerequisite[] = [];
  public metadata = new Map<string, string>();

  constructor(
    id: string,
    public readonly curriculumId: string,
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
