import { IExamPlugin, ScoreConversionResult } from '../interfaces/exam-plugin.interface';
import { ExamType, SectionType } from '../../../services/admin/questions.service';

export class CelpipExamPlugin implements IExamPlugin {
  examType: ExamType = 'CELPIP';
  displayName = 'CELPIP General Test Engine';
  sections: SectionType[] = ['Listening', 'Reading', 'Writing', 'Speaking'];

  calculateOverallScore(rawScore: number, totalQuestions: number): ScoreConversionResult {
    const ratio = Math.min(Math.max(rawScore / (totalQuestions || 40), 0), 1);
    const clbLevel = Math.min(Math.max(Math.round(ratio * 12), 3), 12);

    let cefr: 'B1' | 'B2' | 'C1' | 'C2' = 'B2';
    if (clbLevel >= 10) cefr = 'C2';
    else if (clbLevel >= 8) cefr = 'C1';
    else if (clbLevel >= 6) cefr = 'B2';
    else cefr = 'B1';

    return {
      exam: this.examType,
      rawScore,
      totalQuestions: totalQuestions || 40,
      bandOrScale: `CLB Level ${clbLevel}`,
      overallScore: clbLevel,
      cefrLevel: cefr,
      sectionBreakdown: {
        Listening: clbLevel,
        Reading: clbLevel,
        Writing: clbLevel,
        Speaking: clbLevel,
      },
    };
  }

  validateQuestionBankCount(available: number, required: number): boolean {
    return available >= required;
  }
}
