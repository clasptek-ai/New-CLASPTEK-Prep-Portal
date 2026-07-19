import { Entity } from '@clasptek/kernel';

export class CurriculumTemplateVersion extends Entity<string> {
  constructor(
    id: string,
    public readonly templateId: string,
    public readonly versionNo: string,
    public name: string,
    public description: string,
    public structureSnapshotJson: string, // stringified JSON outline
    public status: string = 'draft'
  ) {
    super(id);
  }
}
