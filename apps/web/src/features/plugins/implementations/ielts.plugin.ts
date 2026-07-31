import { IExamPlugin, ScoreConversionResult } from '../interfaces/exam-plugin.interface';
import { ExamType, SectionType } from '../../../services/admin/questions.service';

export class IeltsExamPlugin implements IExamPlugin {
  examType: ExamType = 'IELTS Academic';
  displayName = 'IELTS Academic & General Training Engine';
  sections: SectionType[] = ['Listening', 'Reading', 'Writing', 'Speaking'];

  calculateOverallScore(rawScore: number, totalQuestions: number): ScoreConversionResult {
    const ratio = Math.min(Math.max(rawScore / (totalQuestions || 40), 0), 1);
    let band = 5.0;
    if (ratio >= 0.88) band = 9.0;
    else if (ratio >= 0.80) band = 8.5;
    else if (ratio >= 0.73) band = 8.0;
    else if (ratio >= 0.65) band = 7.5;
    else if (ratio >= 0.58) band = 7.0;
    else if (ratio >= 0.50) band = 6.5;
    else if (ratio >= 0.40) band = 6.0;

    let cefr: 'B1' | 'B2' | 'C1' | 'C2' = 'B2';
    if (band >= 8.5) cefr = 'C2';
    else if (band >= 7.0) cefr = 'C1';
    else if (band >= 5.5) cefr = 'B2';
    else cefr = 'B1';

    return {
      exam: this.examType,
      rawScore,
      totalQuestions: totalQuestions || 40,
      bandOrScale: `Band ${band.toFixed(1)}`,
      overallScore: band,
      cefrLevel: cefr,
      sectionBreakdown: {
        Reading: band,
        Listening: band,
        Writing: band,
        Speaking: band,
      },
    };
  }

  validateQuestionBankCount(available: number, required: number): boolean {
    return available >= required;
  }
}
