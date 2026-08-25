import {
  EvaluationResult,
  BandScore,
  FeedbackSection,
  EvaluationRecommendation,
} from '@clasptek/domain-ai-evaluation';
import { randomUUID } from 'crypto';
import type { IELTSWritingEvaluationOutput } from './OpenAISchema';
import type { IELTSSpeakingEvaluationOutput } from './OpenAISchema';

export class OpenAIMapper {
  /**
   * Map validated IELTS Writing evaluation output to an EvaluationResult.
   */
  public static mapWritingToEvaluationResult(
    output: IELTSWritingEvaluationOutput,
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
      bandScore: new BandScore(`Band ${output.overallBand}`, output.overallBand),
      isCorrect: output.overallBand >= 6.0,
      evaluationNotes: output.feedback,
    });

    // Overall feedback section
    res.addFeedbackSection(
      new FeedbackSection({
        id: `fb-overall-${resultId}`,
        sectionType: 'OVERALL',
        content: output.feedback,
        orderIndex: 0,
        createdAt: new Date(),
      })
    );

    // Strengths section
    res.addFeedbackSection(
      new FeedbackSection({
        id: `fb-strengths-${resultId}`,
        sectionType: 'STRENGTHS',
        content: output.strengths.join('\n• '),
        orderIndex: 1,
        createdAt: new Date(),
      })
    );

    // Weaknesses/Improvements section
    res.addFeedbackSection(
      new FeedbackSection({
        id: `fb-improvements-${resultId}`,
        sectionType: 'IMPROVEMENTS',
        content: output.weaknesses.join('\n• '),
        orderIndex: 2,
        createdAt: new Date(),
      })
    );

    // Criterion-level feedback sections
    const criteriaNames = [
      {
        key: 'taskAchievement',
        name: output.taskType === 'TASK_1' ? 'Task Achievement' : 'Task Response',
      },
      { key: 'coherenceCohesion', name: 'Coherence & Cohesion' },
      { key: 'lexicalResource', name: 'Lexical Resource' },
      { key: 'grammaticalRangeAccuracy', name: 'Grammatical Range & Accuracy' },
    ];

    criteriaNames.forEach((c, idx) => {
      const score = output.criteria[c.key as keyof typeof output.criteria];
      res.addFeedbackSection(
        new FeedbackSection({
          id: `fb-criterion-${resultId}-${idx}`,
          sectionType: 'CRITERION',
          criterionCode: c.key,
          content: `${c.name}: Band ${score}/9`,
          orderIndex: 3 + idx,
          createdAt: new Date(),
        })
      );
    });

    // Recommendations
    output.improvements.forEach((imp, index) => {
      res.addRecommendation(
        new EvaluationRecommendation({
          id: `rec-${resultId}-${index}`,
          recommendationType: 'IMPROVEMENT',
          priority: 'MEDIUM',
          title: `Writing Improvement ${index + 1}`,
          description: imp,
          createdAt: new Date(),
        })
      );
    });

    return res;
  }

  /**
   * Map validated IELTS Speaking evaluation output to an EvaluationResult.
   */
  public static mapSpeakingToEvaluationResult(
    output: IELTSSpeakingEvaluationOutput,
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
      questionType: 'SPEAKING',
      rawScore: output.overallBand,
      maxScore: 9.0,
      bandScore: new BandScore(`Band ${output.overallBand}`, output.overallBand),
      isCorrect: output.overallBand >= 6.0,
      evaluationNotes: output.feedback,
    });

    // Overall feedback section
    res.addFeedbackSection(
      new FeedbackSection({
        id: `fb-overall-${resultId}`,
        sectionType: 'OVERALL',
        content: output.feedback,
        orderIndex: 0,
        createdAt: new Date(),
      })
    );

    // Strengths section
    res.addFeedbackSection(
      new FeedbackSection({
        id: `fb-strengths-${resultId}`,
        sectionType: 'STRENGTHS',
        content: output.strengths.join('\n• '),
        orderIndex: 1,
        createdAt: new Date(),
      })
    );

    // Weaknesses section
    res.addFeedbackSection(
      new FeedbackSection({
        id: `fb-improvements-${resultId}`,
        sectionType: 'IMPROVEMENTS',
        content: output.weaknesses.join('\n• '),
        orderIndex: 2,
        createdAt: new Date(),
      })
    );

    // Criterion-level feedback
    const speakingCriteria = [
      { key: 'fluencyCoherence', name: 'Fluency & Coherence' },
      { key: 'lexicalResource', name: 'Lexical Resource' },
      { key: 'grammaticalRangeAccuracy', name: 'Grammatical Range & Accuracy' },
      { key: 'pronunciation', name: 'Pronunciation' },
    ];

    speakingCriteria.forEach((c, idx) => {
      const score = output.criteria[c.key as keyof typeof output.criteria];
      res.addFeedbackSection(
        new FeedbackSection({
          id: `fb-criterion-${resultId}-${idx}`,
          sectionType: 'CRITERION',
          criterionCode: c.key,
          content: `${c.name}: Band ${score}/9`,
          orderIndex: 3 + idx,
          createdAt: new Date(),
        })
      );
    });

    // Recommendations
    output.improvements.forEach((imp, index) => {
      res.addRecommendation(
        new EvaluationRecommendation({
          id: `rec-${resultId}-${index}`,
          recommendationType: 'IMPROVEMENT',
          priority: 'MEDIUM',
          title: `Speaking Improvement ${index + 1}`,
          description: imp,
          createdAt: new Date(),
        })
      );
    });

    return res;
  }
}
