import {
  AssessmentScoringService,
  AssessmentResult,
  ResultGenerated,
  ResultVisibilityChanged,
  QuestionAnswerInput,
  VisibilityMode,
  AssessmentResultRepository,
} from '@clasptek/domain-assessment-runtime';
import { randomUUID } from 'crypto';

export interface GenerateResultCommand {
  sessionId: string;
  studentId: string;
  studentAnswers: QuestionAnswerInput[];
  passThresholdPercentage?: number;
  visibilityMode?: VisibilityMode;
  attemptId?: string;
  timeTakenSeconds?: number;
}

/**
 * ResultGenerationService
 *
 * Application orchestration service: loads session context, calls domain
 * AssessmentScoringService, applies ResultVisibilityStrategy, persists AssessmentResult,
 * and emits ResultGenerated & ResultVisibilityChanged domain events.
 */
export class ResultGenerationService {
  private readonly scoringService = new AssessmentScoringService();

  constructor(private readonly resultRepo: AssessmentResultRepository) {}

  public async generateResult(cmd: GenerateResultCommand): Promise<AssessmentResult> {
    const scoringOutput = this.scoringService.score({
      studentAnswers: cmd.studentAnswers,
      passThresholdPercentage: cmd.passThresholdPercentage ?? 60.0,
    });

    const visibilityMode: VisibilityMode = cmd.visibilityMode || 'FULL_REVIEW';
    const resultId = `res-${randomUUID()}`;

    const result = new AssessmentResult(
      resultId,
      cmd.sessionId,
      cmd.studentId,
      scoringOutput.overallScore,
      scoringOutput.maxScore,
      scoringOutput.isPassed,
      visibilityMode,
      scoringOutput.sectionScores,
      scoringOutput.skillScores,
      scoringOutput.practiceRecommendation,
      cmd.timeTakenSeconds || 0,
      new Date(),
      cmd.attemptId
    );

    result.recordEvent(
      new ResultGenerated(
        resultId,
        cmd.sessionId,
        scoringOutput.overallScore,
        scoringOutput.isPassed
      )
    );
    result.recordEvent(new ResultVisibilityChanged(resultId, visibilityMode));

    await this.resultRepo.save(result);
    return result;
  }
}
