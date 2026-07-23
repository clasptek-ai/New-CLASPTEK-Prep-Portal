import {
  AcademicProgressRepository,
  StudentResult,
  ResultType,
  ResultTypeEnum,
  ProgressScore,
  AcademicProgress,
} from '@clasptek/domain-results';
import { randomUUID } from 'crypto';

export interface PublishResultsCommand {
  studentId: string;
  resultType: ResultTypeEnum;
  sourceId: string;
  title: string;
  score?: number;
  maxScore?: number;
  bandScore?: string;
  isPassing?: boolean;
  summaryFeedback?: string;
  details?: Record<string, any>;
}

export class PublishResultsHandler {
  constructor(private readonly resultsRepo: AcademicProgressRepository) {}

  public async execute(cmd: PublishResultsCommand): Promise<string> {
    if (!cmd.studentId) throw new Error('studentId is required');
    if (!cmd.sourceId) throw new Error('sourceId is required');
    if (!cmd.title) throw new Error('title is required');

    let progress = await this.resultsRepo.findByStudentId(cmd.studentId);
    if (!progress) {
      progress = AcademicProgress.create(cmd.studentId);
    }

    const resultId = randomUUID();
    const result = new StudentResult({
      id: resultId,
      studentId: cmd.studentId,
      resultType: new ResultType(cmd.resultType),
      sourceId: cmd.sourceId,
      title: cmd.title,
      ...(cmd.score !== undefined
        ? { score: new ProgressScore(cmd.score, cmd.maxScore ?? 100) }
        : {}),
      ...(cmd.bandScore !== undefined ? { bandScore: cmd.bandScore } : {}),
      ...(cmd.isPassing !== undefined ? { isPassing: cmd.isPassing } : {}),
      ...(cmd.summaryFeedback !== undefined ? { summaryFeedback: cmd.summaryFeedback } : {}),
      ...(cmd.details !== undefined ? { details: cmd.details } : {}),
    });

    progress.addResult(result);

    await this.resultsRepo.save(progress);
    await this.resultsRepo.saveResult(result);
    await this.resultsRepo.recordHistory(cmd.studentId, resultId, 'PUBLISHED', {
      title: cmd.title,
      score: cmd.score,
      resultType: cmd.resultType,
    });

    return resultId;
  }
}
