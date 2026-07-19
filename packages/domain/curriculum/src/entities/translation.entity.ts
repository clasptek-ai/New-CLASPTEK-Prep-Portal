import { Entity } from '@clasptek/kernel';

export class Translation extends Entity<string> {
  constructor(
    id: string,
    public readonly parentEntityId: string,
    public readonly languageCode: string,
    public localizedNameOrTitle: string,
    public localizedSummary?: string,
    public localizedDescription?: string,
    public localizedInstructions?: string,
    public sourceLanguageCode: string = 'en',
    public translationMethod: string = 'human',
    public translationStatus: string = 'draft'
  ) {
    super(id);
  }
}
