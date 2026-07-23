import { AggregateRoot } from '@clasptek/kernel';

export type PassageType =
  'READING' | 'LISTENING_SCRIPT' | 'SPEAKING_CUE_CARD' | 'WRITING_PROMPT' | 'SHARED_RESOURCE';

export interface PassageVersion {
  versionNo: number;
  content: string;
  title: string;
  wordCount: number;
  audioUrl?: string | undefined;
  transcript?: string | undefined;
  createdAt: Date;
  createdBy: string;
}

export class Passage extends AggregateRoot<string> {
  private _versions: PassageVersion[] = [];
  private _referencedQuestionIds: Set<string> = new Set();

  constructor(
    id: string,
    public readonly code: string,
    public title: string,
    public passageType: PassageType,
    public currentContent: string,
    public status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED' = 'DRAFT',
    public versionNo: number = 1,
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public lockVersion: number = 0
  ) {
    super(id);
    this._versions.push({
      versionNo: 1,
      title,
      content: currentContent,
      wordCount: Passage.countWords(currentContent),
      createdAt: new Date(),
      createdBy: 'system',
    });
  }

  public get versions(): readonly PassageVersion[] {
    return this._versions;
  }

  public get referencedQuestionIds(): readonly string[] {
    return Array.from(this._referencedQuestionIds);
  }

  public static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  public static create(
    id: string,
    code: string,
    title: string,
    passageType: PassageType,
    content: string,
    tenantId?: string
  ): Passage {
    return new Passage(id, code, title, passageType, content, 'DRAFT', 1, tenantId);
  }

  public addVersion(
    title: string,
    content: string,
    createdBy: string,
    audioUrl?: string,
    transcript?: string
  ): void {
    const nextVer = this.versionNo + 1;
    this.versionNo = nextVer;
    this.title = title;
    this.currentContent = content;
    this.updatedAt = new Date();

    this._versions.push({
      versionNo: nextVer,
      title,
      content,
      wordCount: Passage.countWords(content),
      audioUrl,
      transcript,
      createdAt: new Date(),
      createdBy,
    });
  }

  public addQuestionReference(questionId: string): void {
    this._referencedQuestionIds.add(questionId);
  }

  public removeQuestionReference(questionId: string): void {
    this._referencedQuestionIds.delete(questionId);
  }

  public publish(): void {
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();
  }

  public archive(): void {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }
}
