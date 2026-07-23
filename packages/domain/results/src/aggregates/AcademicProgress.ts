import { AggregateRoot } from '@clasptek/kernel';
import { randomUUID } from 'crypto';
import { StudentResult } from '../entities/StudentResult';
import { ProgressRecord } from '../entities/ProgressRecord';
import { AcademicSummary } from '../entities/AcademicSummary';
import {
  ResultPublished,
  ProgressUpdated,
  AcademicSummaryUpdated,
} from '../events/ResultsDomainEvents';

export class AcademicProgress extends AggregateRoot<string> {
  public readonly studentId: string;
  private _summary: AcademicSummary | undefined;
  private _results: StudentResult[];
  private _records: ProgressRecord[];
  public readonly lastUpdated: Date;

  constructor(props: {
    id: string;
    studentId: string;
    summary?: AcademicSummary;
    results?: StudentResult[];
    records?: ProgressRecord[];
    lastUpdated?: Date;
  }) {
    super(props.id);
    if (!props.studentId) throw new Error('AcademicProgress studentId cannot be empty');

    this.studentId = props.studentId;
    this._summary = props.summary;
    this._results = [...(props.results ?? [])];
    this._records = [...(props.records ?? [])];
    this.lastUpdated = props.lastUpdated ?? new Date();
  }

  get summary(): AcademicSummary | undefined {
    return this._summary;
  }
  get results(): readonly StudentResult[] {
    return this._results;
  }
  get records(): readonly ProgressRecord[] {
    return this._records;
  }

  public addResult(result: StudentResult): void {
    if (result.studentId !== this.studentId) {
      throw new Error(
        `Result studentId '${result.studentId}' does not match aggregate studentId '${this.studentId}'`
      );
    }

    const exists = this._results.some(
      (r) => r.sourceId === result.sourceId && r.resultType.type === result.resultType.type
    );
    if (exists) {
      throw new Error(
        `Result with sourceId '${result.sourceId}' and type '${result.resultType.type}' already exists`
      );
    }

    this._results.push(result);
    this.addDomainEvent(new ResultPublished(result.id, this.studentId, result.resultType.type));
  }

  public updateSummary(summary: AcademicSummary): void {
    if (summary.studentId !== this.studentId) {
      throw new Error(
        `Summary studentId '${summary.studentId}' does not match aggregate studentId '${this.studentId}'`
      );
    }
    this._summary = summary;
    this.addDomainEvent(new AcademicSummaryUpdated(this.studentId, summary.totalAssessments));
    this.addDomainEvent(
      new ProgressUpdated(this.studentId, summary.overallScore, summary.academicStatus.status)
    );
  }

  public updateRecord(record: ProgressRecord): void {
    if (record.studentId !== this.studentId) {
      throw new Error(
        `Record studentId '${record.studentId}' does not match aggregate studentId '${this.studentId}'`
      );
    }
    const idx = this._records.findIndex((r) => r.skillCode === record.skillCode);
    if (idx >= 0) {
      this._records[idx] = record;
    } else {
      this._records.push(record);
    }
  }

  public static create(studentId: string): AcademicProgress {
    return new AcademicProgress({
      id: randomUUID(),
      studentId,
    });
  }
}
