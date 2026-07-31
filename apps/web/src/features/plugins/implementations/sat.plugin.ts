import { IExamPlugin, ScoreConversionResult } from '../interfaces/exam-plugin.interface';
import { ExamType, SectionType } from '../../../services/admin/questions.service';

export class SatExamPlugin implements IExamPlugin {
  examType: ExamType = 'SAT';
  displayName = 'Digital SAT Assessment Engine';
  sections: SectionType[] = ['Reading', 'Writing', 'Math'];

  calculateOverallScore(rawScore: number, totalQuestions: number): ScoreConversionResult {
    const ratio = Math.min(Math.max(rawScore / (totalQuestions || 40), 0), 1);
    const totalSat = Math.round(400 + ratio * 1200);

    let cefr: 'B1' | 'B2' | 'C1' | 'C2' = 'B2';
    if (totalSat >= 1450) cefr = 'C2';
    else if (totalSat >= 1300) cefr = 'C1';
    else if (totalSat >= 1050) cefr = 'B2';
    else cefr = 'B1';

    return {
      exam: this.examType,
      rawScore,
      totalQuestions: totalQuestions || 40,
      bandOrScale: `${totalSat} / 1600`,
      overallScore: totalSat,
      cefrLevel: cefr,
      sectionBreakdown: {
        ReadingWriting: Math.round(totalSat / 2),
        Math: Math.round(totalSat / 2),
      },
    };
  }

  validateQuestionBankCount(available: number, required: number): boolean {
    return available >= required;
  }
}
