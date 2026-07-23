import { AggregateRoot, Entity, ValueObject } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// 1. Local Domain Event Definitions
export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseQuestionEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class QuestionCreated extends BaseQuestionEvent {
  constructor(questionId: string, code: string) {
    super('QuestionCreated', questionId, { code });
  }
}

export class QuestionUpdated extends BaseQuestionEvent {
  constructor(questionId: string, status: string) {
    super('QuestionUpdated', questionId, { status });
  }
}

export class QuestionPublished extends BaseQuestionEvent {
  constructor(questionId: string, versionNo: string) {
    super('QuestionPublished', questionId, { versionNo });
  }
}

export class QuestionArchived extends BaseQuestionEvent {
  constructor(questionId: string) {
    super('QuestionArchived', questionId);
  }
}

export class QuestionVersionCreated extends BaseQuestionEvent {
  constructor(questionId: string, versionNo: string) {
    super('QuestionVersionCreated', questionId, { versionNo });
  }
}

export class QuestionVersionPublished extends BaseQuestionEvent {
  constructor(questionId: string, versionNo: string) {
    super('QuestionVersionPublished', questionId, { versionNo });
  }
}

export class AnswerOptionAdded extends BaseQuestionEvent {
  constructor(questionId: string, versionNo: string, optionCode: string) {
    super('AnswerOptionAdded', questionId, { versionNo, optionCode });
  }
}

export class RubricUpdated extends BaseQuestionEvent {
  constructor(questionId: string, versionNo: string) {
    super('RubricUpdated', questionId, { versionNo });
  }
}

export class SolutionUpdated extends BaseQuestionEvent {
  constructor(questionId: string, versionNo: string) {
    super('SolutionUpdated', questionId, { versionNo });
  }
}

export class QuestionTagged extends BaseQuestionEvent {
  constructor(questionId: string, tag: string) {
    super('QuestionTagged', questionId, { tag });
  }
}

export class QuestionImported extends BaseQuestionEvent {
  constructor(questionId: string) {
    super('QuestionImported', questionId);
  }
}

export class QuestionValidated extends BaseQuestionEvent {
  constructor(questionId: string, isValid: boolean) {
    super('QuestionValidated', questionId, { isValid });
  }
}

export class QuestionRejected extends BaseQuestionEvent {
  constructor(questionId: string, reason: string) {
    super('QuestionRejected', questionId, { reason });
  }
}

export class QuestionReviewed extends BaseQuestionEvent {
  constructor(questionId: string, reviewerId: string) {
    super('QuestionReviewed', questionId, { reviewerId });
  }
}

export class QuestionApproved extends BaseQuestionEvent {
  constructor(questionId: string, approverId: string) {
    super('QuestionApproved', questionId, { approverId });
  }
}

export class QuestionDuplicated extends BaseQuestionEvent {
  constructor(questionId: string, newQuestionId: string) {
    super('QuestionDuplicated', questionId, { newQuestionId });
  }
}

export class QuestionRetired extends BaseQuestionEvent {
  constructor(questionId: string) {
    super('QuestionRetired', questionId);
  }
}

// 2. Value Objects
export class QuestionCode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    super({ value });
    if (!value || value.trim().length === 0) {
      throw new Error('QuestionCode cannot be empty');
    }
  }

  get value(): string {
    return this.props.value;
  }
}

export class SemanticVersion extends ValueObject<{ value: string }> {
  constructor(value: string) {
    super({ value });
    const regex = /^\d+\.\d+\.\d+$/;
    if (!regex.test(value)) {
      throw new Error('Invalid semantic version format. Expected X.Y.Z');
    }
  }

  get value(): string {
    return this.props.value;
  }
}

// 3. Question Aggregate Model

export class AnswerOption extends Entity<string> {
  constructor(
    id: string,
    public readonly code: string,
    public textContent: string,
    public isCorrect: boolean,
    public displayOrder: number
  ) {
    super(id);
  }
}

export class Solution extends Entity<string> {
  constructor(
    id: string,
    public explanation: string,
    public incorrectExplanation: string,
    public hint: string,
    public referenceUrl: string,
    public teachingNote: string
  ) {
    super(id);
  }
}

export class Rubric extends Entity<string> {
  constructor(
    id: string,
    public criteria: string,
    public maxPoints: number,
    public description: string
  ) {
    super(id);
  }
}

export class QuestionMedia extends Entity<string> {
  constructor(
    id: string,
    public provider: string,
    public bucket: string,
    public objectKey: string,
    public checksum: string,
    public mimeType: string,
    public fileSize: number,
    public durationSeconds: number | null,
    public transcript: string | null,
    public caption: string | null,
    public thumbnailKey: string | null,
    public altText: string | null
  ) {
    super(id);
  }
}

export class QuestionVersion extends Entity<string> {
  public answerOptions: AnswerOption[] = [];
  public solution: Solution | null = null;
  public rubric: Rubric | null = null;
  public mediaAssets: QuestionMedia[] = [];

  constructor(
    id: string,
    public readonly versionNo: SemanticVersion,
    public status: string,
    public title: string,
    public payload: any,
    public digitalSignature: string | null,
    public lockVersion: number = 0
  ) {
    super(id);
  }

  public addAnswerOption(option: AnswerOption): void {
    if (this.status === 'PUBLISHED') {
      throw new Error('Cannot modify answer options of a published question version');
    }
    this.answerOptions.push(option);
  }

  public setSolution(sol: Solution): void {
    if (this.status === 'PUBLISHED') {
      throw new Error('Cannot set solution for a published question version');
    }
    this.solution = sol;
  }

  public setRubric(rub: Rubric): void {
    if (this.status === 'PUBLISHED') {
      throw new Error('Cannot set rubric for a published question version');
    }
    this.rubric = rub;
  }

  public addMedia(media: QuestionMedia): void {
    if (this.status === 'PUBLISHED') {
      throw new Error('Cannot add media to a published question version');
    }
    this.mediaAssets.push(media);
  }
}

export class QuestionStatistics extends Entity<string> {
  constructor(
    id: string,
    public timesUsed: number,
    public timesAnswered: number,
    public correctRate: number,
    public facilityIndex: number,
    public discriminationIndex: number,
    public guessProbability: number,
    public averageDurationMs: number,
    public medianDurationMs: number,
    public skipRate: number,
    public lastUsed: Date | null
  ) {
    super(id);
  }
}

export class QuestionOwnership extends ValueObject<{
  copyrightHolder: string;
  license: string;
  source: string;
  reusePolicy: string;
  expirationDate: Date | null;
}> {
  constructor(
    copyrightHolder: string,
    license: string,
    source: string,
    reusePolicy: string,
    expirationDate: Date | null
  ) {
    super({ copyrightHolder, license, source, reusePolicy, expirationDate });
  }

  get copyrightHolder(): string {
    return this.props.copyrightHolder;
  }
  get license(): string {
    return this.props.license;
  }
  get source(): string {
    return this.props.source;
  }
  get reusePolicy(): string {
    return this.props.reusePolicy;
  }
  get expirationDate(): Date | null {
    return this.props.expirationDate;
  }
}

export class QuestionDependency extends ValueObject<{
  parentQuestionId: string;
  childQuestionId: string;
  dependencyType: string;
}> {
  constructor(parentQuestionId: string, childQuestionId: string, dependencyType: string) {
    super({ parentQuestionId, childQuestionId, dependencyType });
  }

  get parentQuestionId(): string {
    return this.props.parentQuestionId;
  }
  get childQuestionId(): string {
    return this.props.childQuestionId;
  }
  get dependencyType(): string {
    return this.props.dependencyType;
  }
}

export class Question extends AggregateRoot<string> {
  public versions: QuestionVersion[] = [];
  public statistics: QuestionStatistics | null = null;
  public ownership: QuestionOwnership | null = null;
  public dependencies: QuestionDependency[] = [];

  constructor(
    id: string,
    public readonly code: QuestionCode,
    public examProductId: string | null,
    public curriculumModuleId: string | null,
    public status: string,
    public lockVersion: number = 0
  ) {
    super(id);
  }

  public static create(
    id: string,
    code: QuestionCode,
    examProductId: string | null,
    curriculumModuleId: string | null
  ): Question {
    const q = new Question(id, code, examProductId, curriculumModuleId, 'DRAFT');
    q.addDomainEvent(new QuestionCreated(id, code.value));
    return q;
  }

  public createVersion(
    versionId: string,
    versionNo: SemanticVersion,
    title: string,
    payload: any,
    digitalSignature: string | null = null
  ): QuestionVersion {
    const exists = this.versions.some((v) => v.versionNo.equals(versionNo));
    if (exists) {
      throw new Error(`Version ${versionNo.value} already exists for this question`);
    }
    const ver = new QuestionVersion(
      versionId,
      versionNo,
      'DRAFT',
      title,
      payload,
      digitalSignature
    );
    this.versions.push(ver);
    this.addDomainEvent(new QuestionVersionCreated(this.id, versionNo.value));
    return ver;
  }

  public publish(versionNo: SemanticVersion): void {
    const version = this.versions.find((v) => v.versionNo.equals(versionNo));
    if (!version) {
      throw new Error(`Version ${versionNo.value} not found`);
    }
    version.status = 'PUBLISHED';
    this.status = 'PUBLISHED';
    this.addDomainEvent(new QuestionPublished(this.id, versionNo.value));
    this.addDomainEvent(new QuestionVersionPublished(this.id, versionNo.value));
  }

  public archive(): void {
    this.status = 'ARCHIVED';
    this.addDomainEvent(new QuestionArchived(this.id));
  }

  public restore(): void {
    this.status = 'DRAFT';
    this.addDomainEvent(new QuestionUpdated(this.id, 'DRAFT'));
  }

  public addAnswerOption(
    versionNo: SemanticVersion,
    id: string,
    code: string,
    text: string,
    isCorrect: boolean,
    displayOrder: number
  ): void {
    const version = this.versions.find((v) => v.versionNo.equals(versionNo));
    if (!version) {
      throw new Error(`Version ${versionNo.value} not found`);
    }
    version.addAnswerOption(new AnswerOption(id, code, text, isCorrect, displayOrder));
    this.addDomainEvent(new AnswerOptionAdded(this.id, versionNo.value, code));
  }

  public setSolution(
    versionNo: SemanticVersion,
    id: string,
    explanation: string,
    incorrectExplanation: string,
    hint: string,
    referenceUrl: string,
    teachingNote: string
  ): void {
    const version = this.versions.find((v) => v.versionNo.equals(versionNo));
    if (!version) {
      throw new Error(`Version ${versionNo.value} not found`);
    }
    version.setSolution(
      new Solution(id, explanation, incorrectExplanation, hint, referenceUrl, teachingNote)
    );
    this.addDomainEvent(new SolutionUpdated(this.id, versionNo.value));
  }

  public setRubric(
    versionNo: SemanticVersion,
    id: string,
    criteria: string,
    maxPoints: number,
    description: string
  ): void {
    const version = this.versions.find((v) => v.versionNo.equals(versionNo));
    if (!version) {
      throw new Error(`Version ${versionNo.value} not found`);
    }
    version.setRubric(new Rubric(id, criteria, maxPoints, description));
    this.addDomainEvent(new RubricUpdated(this.id, versionNo.value));
  }

  public addMedia(versionNo: SemanticVersion, media: QuestionMedia): void {
    const version = this.versions.find((v) => v.versionNo.equals(versionNo));
    if (!version) {
      throw new Error(`Version ${versionNo.value} not found`);
    }
    version.addMedia(media);
  }

  public setOwnership(ownership: QuestionOwnership): void {
    this.ownership = ownership;
  }

  public updateStatistics(stats: QuestionStatistics): void {
    this.statistics = stats;
  }

  public addDependency(dependency: QuestionDependency): void {
    this.dependencies.push(dependency);
  }
}

// 4. QuestionReview Aggregate Model

export class ValidationReport extends Entity<string> {
  constructor(
    id: string,
    public readonly validatorName: string,
    public readonly isValid: boolean,
    public readonly errors: string[]
  ) {
    super(id);
  }
}

export class ReviewerComment extends Entity<string> {
  constructor(
    id: string,
    public readonly reviewerId: string,
    public readonly role: string,
    public readonly commentText: string,
    public readonly timestamp: Date
  ) {
    super(id);
  }
}

export class WorkflowHistory extends Entity<string> {
  constructor(
    id: string,
    public readonly stage: string,
    public readonly actorId: string,
    public readonly comments: string,
    public readonly timestamp: Date
  ) {
    super(id);
  }
}

export class ReviewRequest extends AggregateRoot<string> {
  public validationReports: ValidationReport[] = [];
  public reviewerComments: ReviewerComment[] = [];
  public history: WorkflowHistory[] = [];

  constructor(
    id: string,
    public readonly questionId: string,
    public status: string,
    public lockVersion: number = 0
  ) {
    super(id);
  }

  public static create(id: string, questionId: string): ReviewRequest {
    const req = new ReviewRequest(id, questionId, 'UNDER_REVIEW');
    req.addDomainEvent(new QuestionReviewed(questionId, 'system'));
    return req;
  }

  public addValidationReport(
    reportId: string,
    validatorName: string,
    isValid: boolean,
    errors: string[]
  ): void {
    const report = new ValidationReport(reportId, validatorName, isValid, errors);
    this.validationReports.push(report);
    this.addDomainEvent(new QuestionValidated(this.questionId, isValid));
  }

  public addComment(
    commentId: string,
    reviewerId: string,
    role: string,
    commentText: string
  ): void {
    const comment = new ReviewerComment(commentId, reviewerId, role, commentText, new Date());
    this.reviewerComments.push(comment);
  }

  public approve(actorId: string, comment: string, historyId: string): void {
    this.status = 'APPROVED';
    this.history.push(new WorkflowHistory(historyId, 'APPROVED', actorId, comment, new Date()));
    this.addDomainEvent(new QuestionApproved(this.questionId, actorId));
  }

  public reject(actorId: string, comment: string, historyId: string): void {
    this.status = 'REJECTED';
    this.history.push(new WorkflowHistory(historyId, 'REJECTED', actorId, comment, new Date()));
    this.addDomainEvent(new QuestionRejected(this.questionId, comment));
  }
}
