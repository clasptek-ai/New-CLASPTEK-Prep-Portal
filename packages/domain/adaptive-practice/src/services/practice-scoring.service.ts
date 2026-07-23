import { PracticeSkillScore } from '../aggregates/practice-result.aggregate';

export interface PracticeAnswerItem {
  questionId: string;
  skillId: string;
  skillName: string;
  isCorrect: boolean;
  points: number;
  timeSpentSeconds: number;
}

export interface PracticeScoringInput {
  answers: PracticeAnswerItem[];
}

export interface PracticeScoringResult {
  overallScore: number;
  maxScore: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  skillScores: PracticeSkillScore[];
}

/**
 * PracticeScoringService
 *
 * Pure domain policy calculating overall score, accuracy %, section/skill scores,
 * and total time spent.
 */
export class PracticeScoringService {
  public calculate(input: PracticeScoringInput): PracticeScoringResult {
    let earned = 0;
    let max = 0;
    let correctCount = 0;
    let totalTime = 0;

    const skillMap = new Map<
      string,
      { name: string; earned: number; max: number; correct: number; total: number }
    >();

    for (const a of input.answers) {
      const p = a.isCorrect ? a.points : 0;
      earned += p;
      max += a.points;
      if (a.isCorrect) correctCount++;
      totalTime += a.timeSpentSeconds;

      const sk = skillMap.get(a.skillId) || {
        name: a.skillName,
        earned: 0,
        max: 0,
        correct: 0,
        total: 0,
      };
      sk.earned += p;
      sk.max += a.points;
      if (a.isCorrect) sk.correct++;
      sk.total++;
      skillMap.set(a.skillId, sk);
    }

    const accuracy = input.answers.length > 0 ? (correctCount / input.answers.length) * 100 : 0;
    const skillScores: PracticeSkillScore[] = Array.from(skillMap.entries()).map(([skId, val]) => {
      const pct = val.max > 0 ? (val.earned / val.max) * 100 : 0;
      return {
        skillId: skId,
        skillName: val.name,
        score: val.earned,
        maxScore: val.max,
        percentage: Number(pct.toFixed(1)),
      };
    });

    return {
      overallScore: Number(earned.toFixed(2)),
      maxScore: Number(max.toFixed(2)),
      accuracyPercentage: Number(accuracy.toFixed(1)),
      totalTimeSeconds: totalTime,
      skillScores,
    };
  }
}
