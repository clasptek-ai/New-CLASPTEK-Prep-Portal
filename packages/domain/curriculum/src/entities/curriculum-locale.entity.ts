import { Entity } from '@clasptek/kernel';

export class CurriculumLocale extends Entity<string> {
  constructor(
    id: string,
    public readonly curriculumVersionId: string,
    public readonly languageCode: string,
    public isDefault: boolean = false,
    public isRequiredForPublication: boolean = false,
    public translationStatus: string = 'not_started',
    public displayOrder: number = 1
  ) {
    super(id);
  }
}
