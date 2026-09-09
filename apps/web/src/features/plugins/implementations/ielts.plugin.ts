import { IExamPlugin, ScoreConversionResult } from '../interfaces/exam-plugin.interface';
import { ExamType, SectionType } from '../../../services/admin/questions.service';

/**
 * Official IELTS Academic Listening Band Score conversion (raw score out of 40)
 * Source: British Council / IELTS official score descriptors
 */
function calculateListeningBand(raw: number): number {
  if (raw >= 39) return 9.0;
  if (raw >= 37) return 8.5;
  if (raw >= 35) return 8.0;
  if (raw >= 32) return 7.5;
  if (raw >= 30) return 7.0;
  if (raw >= 27) return 6.5; // 26 → 6.0 per official spec
  if (raw >= 23) return 6.0;
  if (raw >= 18) return 5.5;
  if (raw >= 16) return 5.0;
  if (raw >= 13) return 4.5;
  if (raw >= 10) return 4.0;
  if (raw >= 8) return 3.5;
  if (raw >= 6) return 3.0;
  if (raw >= 4) return 2.5;
  if (raw >= 2) return 2.0;
  return 1.0;
}

/**
 * Official IELTS Academic Reading Band Score conversion (raw score out of 40)
 * Source: British Council / IELTS official score descriptors
 */
function calculateReadingBand(raw: number): number {
  if (raw >= 39) return 9.0;
  if (raw >= 37) return 8.5;
  if (raw >= 35) return 8.0;
  if (raw >= 33) return 7.5;
  if (raw >= 30) return 7.0;
  if (raw >= 27) return 6.5;
  if (raw >= 23) return 6.0;
  if (raw >= 19) return 5.5;
  if (raw >= 15) return 5.0;
  if (raw >= 13) return 4.5;
  if (raw >= 10) return 4.0;
  if (raw >= 8) return 3.5;
  if (raw >= 6) return 3.0;
  if (raw >= 4) return 2.5;
  if (raw >= 2) return 2.0;
  return 1.0;
}

/**
 * IELTS Overall Band = arithmetic mean of all 4 section bands, rounded to nearest 0.5
 * Per official IELTS rounding rules: x.25–x.74 → x.5, x.75–x.99 → (x+1).0
 */
function roundIELTSBand(avg: number): number {
  return Math.round(avg * 2) / 2;
}

export class IeltsExamPlugin implements IExamPlugin {
  examType: ExamType = 'IELTS Academic';
  displayName = 'IELTS Academic & General Training Engine';
  sections: SectionType[] = ['Listening', 'Reading', 'Writing', 'Speaking'];

  calculateOverallScore(rawScore: number, totalQuestions: number): ScoreConversionResult {
    // Determine per-section raw scores
    // When called with combined objective score (Listening + Reading, max 80):
    //   split evenly between Listening and Reading for band calculation
    // When called with 40 questions (single section): treat as combined Listening+Reading halved
    const totalQ = totalQuestions || 80;
    const isFullExam = totalQ >= 80;

    let listeningRaw: number;
    let readingRaw: number;

    if (isFullExam) {
      // Combined: assume equal split (approximate — section bands are accurate in submit route)
      listeningRaw = Math.round(rawScore / 2);
      readingRaw = rawScore - listeningRaw;
    } else {
      // Single section approximation
      listeningRaw = Math.round(rawScore / 2);
      readingRaw = rawScore - listeningRaw;
    }

    const listeningBand = calculateListeningBand(listeningRaw);
    const readingBand = calculateReadingBand(readingRaw);

    // For overall when Writing and Speaking are pending (not yet evaluated), use available bands
    // This gives an estimated partial band (L+R only, Writing+Speaking assumed 0 pending)
    // Note: The submit route uses the dedicated section calculators for accurate section scores.
    // This plugin call is used only for the `officialScoreLabel` string.
    const objectiveAvg = (listeningBand + readingBand) / 2;
    const band = roundIELTSBand(objectiveAvg);

    let cefr: 'B1' | 'B2' | 'C1' | 'C2' = 'B2';
    if (band >= 8.5) cefr = 'C2';
    else if (band >= 7.0) cefr = 'C1';
    else if (band >= 5.5) cefr = 'B2';
    else cefr = 'B1';

    return {
      exam: this.examType,
      rawScore,
      totalQuestions: totalQ,
      bandOrScale: `Band ${band.toFixed(1)}`,
      overallScore: band,
      cefrLevel: cefr,
      sectionBreakdown: {
        Reading: readingBand,
        Listening: listeningBand,
        Writing: 0, // pending subjective evaluation
        Speaking: 0, // pending subjective evaluation
      },
    };
  }

  validateQuestionBankCount(available: number, required: number): boolean {
    return available >= required;
  }
}

