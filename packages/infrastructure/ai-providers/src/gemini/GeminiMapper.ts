import {
  EvaluationResult,
  BandScore,
  FeedbackSection,
  EvaluationRecommendation,
} from '@clasptek/domain-ai-evaluation';
import { randomUUID } from 'crypto';
import { GeminiEvaluationOutput } from './GeminiSchema';

export class GeminiMapper {
  public static mapToEvaluationResult(
    output: GeminiEvaluationOutput,
    studentId: string,
    submissionId: string,
    jobId: string
  ): EvaluationResult {
    const resultId = `res-${randomUUID()}`;

    const res = new EvaluationResult({
      id: resultId,
      jobId,
      snapshotId: `snap-${jobId}`,
      studentId,
      submissionId,
      questionType: 'WRITING',
      rawScore: output.overallBand,
      maxScore: 9.0,
      bandScore: new BandScore(String(output.overallBand), output.overallBand),
      isCorrect: output.overallBand >= 6.0,
      evaluationNotes: output.feedback,
    });

    res.addFeedbackSection(
      new FeedbackSection({
        id: `fb-sec-${resultId}`,
        sectionType: 'OVERALL',
        content: output.feedback,
        orderIndex: 0,
        createdAt: new Date(),
      })
    );

    output.improvements.forEach((imp, index) => {
      res.addRecommendation(
        new EvaluationRecommendation({
          id: `rec-${resultId}-${index}`,
          recommendationType: 'IMPROVEMENT',
          priority: 'MEDIUM',
          title: 'Rubric recommendation',
          description: imp,
          createdAt: new Date(),
        })
      );
    });

    return res;
  }
}
