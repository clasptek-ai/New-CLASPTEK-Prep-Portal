import { AggregateRoot, Entity } from '@clasptek/kernel';
import { QuestionCode, QuestionStatus } from '../value-objects/question-value-objects';
import {
  QuestionCreated,
  QuestionUpdated,
  QuestionPublished,
  QuestionArchived,
  QuestionOwnershipTransferred,
} from '../events/question-events';

export class AnswerOption extends Entity<string> {
  constructor(
    id: string,
    public readonly optionCode: string,
    public optionText: string,
    public isCorrect: boolean,
    public displayOrder: number
  ) {
    super(id);
  }

  get code(): string {
    return this.optionCode;
  }

  get textContent(): string {
    return this.optionText;
  }
}

export class QuestionMedia extends Entity<string> {
  constructor(
    id: string,
    public readonly storageAssetId: string,
    public associationType: string,
    public displayOrder: number = 1
  ) {
    super(id);
  }
}

export class Solution extends Entity<string> {
  constructor(
    id: string,
    public solutionType: string,
    public content: string,
    public targetOptionId: string | null = null
  ) {
    super(id);
  }
}

export class Rubric extends Entity<string> {
  constructor(
    id: string,
    public criterionName: string,
    public maxPoints: number,
    public description: string,
    public gradingGuidelines: Record<string, any>
  ) {
    super(id);
  }
}

export class QuestionVersion extends Entity<string> {
  public answerOptions: AnswerOption[] = [];
  public mediaAssets: QuestionMedia[] = [];
  public solutions: Solution[] = [];
  public rubrics: Rubric[] = [];

  constructor(
    id: string,
    public readonly questionId: string,
    public readonly versionNo: number,
    public versionLabel: string | null,
    public prompt: string,
    public payload: Record<string, any>,
    public explanation: string | null,
    public status: string = 'draft',
    public lockVersion: number = 0
  ) {
    super(id);
  }

  public validateInvariants(): void {
    const type = this.payload.questionType || '';

    // MCQ validation
    if (type === 'mcq_single') {
      const correctCount = this.answerOptions.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        throw new Error('MCQ Single Choice must have exactly 1 correct option.');
      }
      if (this.answerOptions.length < 2) {
        throw new Error('MCQ Single Choice must have at least 2 options.');
      }
    } else if (type === 'mcq_multi') {
      const correctCount = this.answerOptions.filter((o) => o.isCorrect).length;
      if (correctCount < 2) {
        throw new Error('MCQ Multiple Choice must have at least 2 correct options.');
      }
      if (this.answerOptions.length < 2) {
        throw new Error('MCQ Multiple Choice must have at least 2 options.');
      }
    }
  }

  public addAnswerOption(option: AnswerOption): void {
    if (this.status === 'published') {
      throw new Error('Cannot modify option of a published question version');
    }
    this.answerOptions.push(option);
  }

  public addMedia(media: QuestionMedia): void {
    if (this.status === 'published') {
      throw new Error('Cannot add media to a published question version');
    }
    this.mediaAssets.push(media);
  }

  public addSolution(sol: Solution): void {
    if (this.status === 'published') {
      throw new Error('Cannot modify solution of a published question version');
    }
    this.solutions.push(sol);
  }

  public addRubric(rubric: Rubric): void {
    if (this.status === 'published') {
      throw new Error('Cannot modify rubric of a published question version');
    }
    this.rubrics.push(rubric);
  }
}

export class QuestionStatistics extends Entity<string> {
  constructor(
    id: string,
    public readonly questionVersionId: string,
    public facilityIndex: number,
    public discriminationIndex: number,
    public pointBiserial: number,
    public guessProbability: number,
    public irtParameterA: number,
    public irtParameterB: number,
    public irtParameterC: number
  ) {
    super(id);
  }
}

export class QuestionOwnership extends Entity<string> {
  constructor(
    id: string,
    public readonly questionId: string,
    public ownerOrgId: string,
    public licenseType: string,
    public copyrightYear: number,
    public attributionText: string | null
  ) {
    super(id);
  }
}

export class QuestionDependency extends Entity<string> {
  constructor(
    id: string,
    public readonly parentId: string,
    public readonly childId: string,
    public displayOrder: number = 1
  ) {
    super(id);
  }
}

export class Question extends AggregateRoot<string> {
  public versions: QuestionVersion[] = [];
  public statistics: QuestionStatistics[] = [];
  public ownership: QuestionOwnership | null = null;
  public dependencies: QuestionDependency[] = [];

  constructor(
    id: string,
    public readonly code: QuestionCode,
    public parentQuestionId: string | null,
    public currentVersionId: string | null,
    public status: QuestionStatus,
    public readonly tenantId: string,
    public lockVersion: number = 0
  ) {
    super(id);
  }

  public static create(
    id: string,
    code: QuestionCode,
    parentQuestionId: string | null,
    tenantId: string
  ): Question {
    const q = new Question(id, code, parentQuestionId, null, new QuestionStatus('draft'), tenantId);
    q.addDomainEvent(new QuestionCreated(id, code.value));
    return q;
  }

  public createVersion(
    versionId: string,
    versionNo: number,
    versionLabel: string | null,
    prompt: string,
    payload: Record<string, any>,
    explanation: string | null
  ): QuestionVersion {
    if (this.versions.some((v) => v.versionNo === versionNo)) {
      throw new Error(`Version number ${versionNo} already exists`);
    }
    const ver = new QuestionVersion(
      versionId,
      this.id,
      versionNo,
      versionLabel,
      prompt,
      payload,
      explanation,
      'draft'
    );
    this.versions.push(ver);
    return ver;
  }

  public publish(versionId: string, publishedBy: string): void {
    const version = this.versions.find((v) => v.id === versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }
    version.validateInvariants();
    version.status = 'published';
    this.status = new QuestionStatus('published');
    this.currentVersionId = versionId;
    this.addDomainEvent(new QuestionPublished(this.id, versionId, publishedBy));
  }

  public archive(archivedBy: string): void {
    this.status = new QuestionStatus('archived');
    this.addDomainEvent(new QuestionArchived(this.id, archivedBy));
  }

  public restore(): void {
    this.status = new QuestionStatus('draft');
    this.addDomainEvent(new QuestionUpdated(this.id, ['status']));
  }

  public setOwnership(ownership: QuestionOwnership): void {
    this.ownership = ownership;
    this.addDomainEvent(new QuestionOwnershipTransferred(this.id, 'none', ownership.ownerOrgId));
  }

  public addDependency(childId: string, depId: string, displayOrder: number): QuestionDependency {
    const dep = new QuestionDependency(depId, this.id, childId, displayOrder);
    this.dependencies.push(dep);
    return dep;
  }

  public addAnswerOption(
    versionLabel: { value: string } | string,
    optId: string,
    optCode: string,
    optText: string,
    isCorrect: boolean,
    displayOrder: number
  ): void {
    const labelStr = typeof versionLabel === 'string' ? versionLabel : versionLabel.value;
    const version = this.versions.find((v) => v.versionLabel === labelStr);
    if (!version) {
      throw new Error(`Version with label ${labelStr} not found`);
    }
    version.addAnswerOption(new AnswerOption(optId, optCode, optText, isCorrect, displayOrder));
  }

  public setSolution(
    versionLabel: { value: string } | string,
    solId: string,
    explanation: string,
    _incorrectExplanation?: string,
    _hint?: string,
    _referenceUrl?: string,
    _teachingNote?: string
  ): void {
    const labelStr = typeof versionLabel === 'string' ? versionLabel : versionLabel.value;
    const version = this.versions.find((v) => v.versionLabel === labelStr);
    if (!version) {
      throw new Error(`Version with label ${labelStr} not found`);
    }
    version.addSolution(new Solution(solId, 'general', explanation));
  }

  public setRubric(
    versionLabel: { value: string } | string,
    rubId: string,
    criteria: string,
    maxPoints: number,
    description?: string
  ): void {
    const labelStr = typeof versionLabel === 'string' ? versionLabel : versionLabel.value;
    const version = this.versions.find((v) => v.versionLabel === labelStr);
    if (!version) {
      throw new Error(`Version with label ${labelStr} not found`);
    }
    version.addRubric(new Rubric(rubId, criteria, maxPoints, description || '', {}));
  }

  public addMedia(versionLabel: { value: string } | string, media: any): void {
    const labelStr = typeof versionLabel === 'string' ? versionLabel : versionLabel.value;
    const version = this.versions.find((v) => v.versionLabel === labelStr);
    if (!version) {
      throw new Error(`Version with label ${labelStr} not found`);
    }
    version.addMedia(media);
  }
}
