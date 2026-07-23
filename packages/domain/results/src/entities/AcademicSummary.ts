import { Entity } from '@clasptek/kernel';
import { AcademicStatus } from '../value-objects/AcademicStatus';
import { PerformanceTrend } from '../value-objects/PerformanceTrend';

export class AcademicSummary extends Entity<string> {
  public readonly studentId: string;
  public readonly overallScore: number;
  public readonly academicStatus: AcademicStatus;
  public readonly performanceTrend: PerformanceTrend;
  public readonly totalAssessments: number;
  public readonly totalPractices: number;
  public readonly totalMocks: number;
  public readonly totalEvaluations: number;
  public readonly averageBandScore: string | undefined;
  public readonly strongestSkills: string[];
  public readonly weakestSkills: string[];
  public readonly lastCalculatedAt: Date;

  constructor(props: {
    id: string;
    studentId: string;
    overallScore: number;
    academicStatus: AcademicStatus;
    performanceTrend: PerformanceTrend;
    totalAssessments?: number;
    totalPractices?: number;
    totalMocks?: number;
    totalEvaluations?: number;
    averageBandScore?: string;
    strongestSkills?: string[];
    weakestSkills?: string[];
    lastCalculatedAt?: Date;
  }) {
    super(props.id);
    if (!props.studentId) throw new Error('AcademicSummary studentId cannot be empty');

    this.studentId = props.studentId;
    this.overallScore = props.overallScore;
    this.academicStatus = props.academicStatus;
    this.performanceTrend = props.performanceTrend;
    this.totalAssessments = props.totalAssessments ?? 0;
    this.totalPractices = props.totalPractices ?? 0;
    this.totalMocks = props.totalMocks ?? 0;
    this.totalEvaluations = props.totalEvaluations ?? 0;
    this.averageBandScore = props.averageBandScore;
    this.strongestSkills = [...(props.strongestSkills ?? [])];
    this.weakestSkills = [...(props.weakestSkills ?? [])];
    this.lastCalculatedAt = props.lastCalculatedAt ?? new Date();
  }
}
