import { ReadinessFramework } from '../aggregates/readiness-framework.aggregate';
import { Result } from '@clasptek/kernel';

export interface StudentProgress {
  overallProgress: number;
  componentsScored: Record<string, number>;
  skillsMastered: Record<string, number>;
}

export class ReadinessCalculationService {
  public calculate(
    framework: ReadinessFramework,
    progress: StudentProgress
  ): Result<{ isReady: boolean; confidence: number }, Error> {
    try {
      let passedCount = 0;
      let totalMandatory = 0;

      for (const criterion of framework.criteria) {
        if (criterion.isMandatory) {
          totalMandatory++;
          
          if (criterion.criterionType === 'PROGRESS') {
            if (progress.overallProgress >= (criterion.targetValue ?? 0)) {
              passedCount++;
            }
          } else if (criterion.criterionType === 'COMPONENT_SCORE') {
            const compId = criterion.officialExamComponentId || '';
            const score = progress.componentsScored[compId] ?? 0;
            if (score >= (criterion.minimumValue ?? 0)) {
              passedCount++;
            }
          } else if (criterion.criterionType === 'SKILL_MASTERY') {
            const skillId = criterion.skillRevisionId || '';
            const mastery = progress.skillsMastered[skillId] ?? 0;
            if (mastery >= (criterion.targetValue ?? 0)) {
              passedCount++;
            }
          }
        }
      }

      const isReady = totalMandatory === 0 || passedCount === totalMandatory;
      const confidence = totalMandatory > 0 ? passedCount / totalMandatory : 1.0;

      return Result.success({ isReady, confidence });
    } catch (err: any) {
      return Result.failure(err);
    }
  }
}
