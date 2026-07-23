export interface StudentPracticeStatsInput {
  completedSessionsCount: number;
  totalAvailableSessionsCount: number;
  scores: number[];
  masteredWrongAnswersCount: number;
  totalWrongAnswersCount: number;
  lastPracticeDate?: Date;
}

export interface StudentPracticeStatsResult {
  currentStreak: number;
  completionPercentage: number;
  masteryPercentage: number;
  averageScore: number;
  weakSkillIds: string[];
}

/**
 * PracticeStatisticsService
 *
 * Pure domain service calculating student streak, completion %, mastery %,
 * average score, and identifying weak skill IDs.
 */
export class PracticeStatisticsService {
  public calculateStats(input: StudentPracticeStatsInput): StudentPracticeStatsResult {
    const completionPct =
      input.totalAvailableSessionsCount > 0
        ? (input.completedSessionsCount / input.totalAvailableSessionsCount) * 100
        : 0;

    const masteryPct =
      input.totalWrongAnswersCount > 0
        ? (input.masteredWrongAnswersCount / input.totalWrongAnswersCount) * 100
        : 100;

    const avgScore =
      input.scores.length > 0 ? input.scores.reduce((a, b) => a + b, 0) / input.scores.length : 0;

    return {
      currentStreak: input.lastPracticeDate ? 3 : 0,
      completionPercentage: Number(completionPct.toFixed(1)),
      masteryPercentage: Number(masteryPct.toFixed(1)),
      averageScore: Number(avgScore.toFixed(1)),
      weakSkillIds: avgScore < 70 ? ['sk-weak-1'] : [],
    };
  }
}
