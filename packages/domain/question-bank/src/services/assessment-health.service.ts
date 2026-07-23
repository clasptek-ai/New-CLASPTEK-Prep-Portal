export interface HealthCheckInput {
  targetBlueprintCount: number;
  allocatedQuestionCount: number;
  targetSkillCount: number;
  coveredSkillCount: number;
  targetDifficultyDistribution: { EASY: number; MEDIUM: number; HARD: number; EXPERT: number };
  allocatedDifficultyDistribution: { EASY: number; MEDIUM: number; HARD: number; EXPERT: number };
  targetDurationMinutes: number;
  allocatedDurationMinutes: number;
  targetQuestionTypeCount: number;
  coveredQuestionTypeCount: number;
}

export interface AssessmentHealthResult {
  score: number;
  isHealthy: boolean;
  breakdown: {
    blueprintCoverageScore: number;
    skillCoverageScore: number;
    difficultyBalanceScore: number;
    timingAccuracyScore: number;
    questionTypeDistributionScore: number;
  };
  recommendations: string[];
}

/**
 * AssessmentHealthService
 *
 * Pure domain policy located in domain-question-bank layer.
 * Zero infrastructure dependencies. Calculates 0-100 numerical Health Score
 * combining Blueprint Coverage, Skill Coverage, Difficulty Balance, Timing, and Question Distribution.
 */
export class AssessmentHealthService {
  public calculateHealth(input: HealthCheckInput): AssessmentHealthResult {
    const recommendations: string[] = [];

    // 1. Blueprint Coverage (weight 25%)
    const blueprintRatio =
      input.targetBlueprintCount > 0
        ? Math.min(1, input.allocatedQuestionCount / input.targetBlueprintCount)
        : 1;
    const blueprintScore = blueprintRatio * 100;
    if (blueprintRatio < 1) {
      recommendations.push(
        `Allocate ${input.targetBlueprintCount - input.allocatedQuestionCount} more questions to meet blueprint target.`
      );
    }

    // 2. Skill Coverage (weight 25%)
    const skillRatio =
      input.targetSkillCount > 0
        ? Math.min(1, input.coveredSkillCount / input.targetSkillCount)
        : 1;
    const skillScore = skillRatio * 100;
    if (skillRatio < 1) {
      recommendations.push(
        `Cover ${input.targetSkillCount - input.coveredSkillCount} missing target skills.`
      );
    }

    // 3. Difficulty Balance (weight 20%)
    let diffDiffSum = 0;
    let totalTargetDiff = 0;
    for (const key of ['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const) {
      const target = input.targetDifficultyDistribution[key] || 0;
      const alloc = input.allocatedDifficultyDistribution[key] || 0;
      totalTargetDiff += target;
      diffDiffSum += Math.abs(target - alloc);
    }
    const difficultyRatio =
      totalTargetDiff > 0 ? Math.max(0, 1 - diffDiffSum / totalTargetDiff) : 1;
    const difficultyScore = difficultyRatio * 100;
    if (difficultyRatio < 0.9) {
      recommendations.push('Adjust difficulty distribution to match blueprint target percentages.');
    }

    // 4. Timing Accuracy (weight 15%)
    const timingDiff = Math.abs(input.targetDurationMinutes - input.allocatedDurationMinutes);
    const timingRatio =
      input.targetDurationMinutes > 0
        ? Math.max(0, 1 - timingDiff / input.targetDurationMinutes)
        : 1;
    const timingScore = timingRatio * 100;
    if (timingRatio < 0.95) {
      recommendations.push(
        `Adjust allocated duration by ${input.targetDurationMinutes - input.allocatedDurationMinutes} minutes.`
      );
    }

    // 5. Question Type Distribution (weight 15%)
    const typeRatio =
      input.targetQuestionTypeCount > 0
        ? Math.min(1, input.coveredQuestionTypeCount / input.targetQuestionTypeCount)
        : 1;
    const typeScore = typeRatio * 100;
    if (typeRatio < 1) {
      recommendations.push('Include missing question types required by blueprint specification.');
    }

    const overallScore = Number(
      (
        blueprintScore * 0.25 +
        skillScore * 0.25 +
        difficultyScore * 0.2 +
        timingScore * 0.15 +
        typeScore * 0.15
      ).toFixed(1)
    );

    return {
      score: overallScore,
      isHealthy: overallScore >= 80,
      breakdown: {
        blueprintCoverageScore: Number(blueprintScore.toFixed(1)),
        skillCoverageScore: Number(skillScore.toFixed(1)),
        difficultyBalanceScore: Number(difficultyScore.toFixed(1)),
        timingAccuracyScore: Number(timingScore.toFixed(1)),
        questionTypeDistributionScore: Number(typeScore.toFixed(1)),
      },
      recommendations,
    };
  }
}
