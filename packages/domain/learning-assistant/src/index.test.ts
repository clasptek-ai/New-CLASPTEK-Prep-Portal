import { describe, test, expect } from 'vitest';
import {
  StudyDuration,
  ReadinessGain,
  LearningProgress,
  LearningPlan,
  LearningTask,
  SkillProgress,
  LearningPlanningEngine,
  SkillAnalysisEngine,
  RecommendationEngine,
  DailyTaskEngine,
  WeeklyPlannerEngine,
  RevisionEngine,
} from './index';

describe('Domain Learning Assistant Value Objects', () => {
  test('StudyDuration enforces 0 to 720 minutes boundary', () => {
    expect(new StudyDuration(60).minutes).toBe(60);
    expect(() => new StudyDuration(-10)).toThrow();
    expect(() => new StudyDuration(800)).toThrow();
  });

  test('ReadinessGain rounds points cleanly', () => {
    expect(new ReadinessGain(5.556).points).toBe(5.56);
    expect(() => new ReadinessGain(-1)).toThrow();
  });

  test('LearningProgress enforces percentage boundary', () => {
    expect(new LearningProgress(85.5).percentage).toBe(85.5);
    expect(() => new LearningProgress(150)).toThrow();
  });
});

describe('Domain Learning Assistant Aggregates & Entities', () => {
  test('LearningPlan progress calculation', () => {
    const plan = new LearningPlan({
      id: 'plan-1',
      studentId: 'stud-1',
      targetScore: 85,
      targetDate: new Date('2026-12-31'),
      status: 'ACTIVE',
      dailyGoalMinutes: 60,
      totalTasksGenerated: 10,
      completedTasksCount: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(plan.progressPercentage).toBe(40);
    plan.recordTaskCompletion();
    expect(plan.completedTasksCount).toBe(5);
    expect(plan.progressPercentage).toBe(50);
  });

  test('LearningTask completes correctly', () => {
    const task = new LearningTask({
      id: 'task-1',
      planId: 'plan-1',
      title: 'Practice Math',
      description: 'Solve 10 algebra questions',
      taskType: 'WEAKNESS_REMEDIATION',
      priority: 'HIGH',
      estimatedMinutes: 30,
      status: 'PENDING',
      createdAt: new Date(),
    });

    expect(task.status).toBe('PENDING');
    task.complete(25);
    expect(task.status).toBe('COMPLETED');
    expect(task.actualMinutes).toBe(25);
    expect(task.completedAt).toBeDefined();
  });
});

describe('Domain Engines', () => {
  test('LearningPlanningEngine calculates parameters deterministically', () => {
    const params = LearningPlanningEngine.calculatePlanParameters({
      currentReadiness: 60,
      targetScore: 80,
      daysUntilExam: 30,
    });

    expect(params.dailyGoalMinutes).toBeGreaterThan(0);
    expect(params.recommendedTaskCountPerDay).toBeGreaterThan(0);
    expect(['LIGHT', 'MODERATE', 'HIGH']).toContain(params.intensityLevel);
  });

  test('SkillAnalysisEngine identifies weak skills needing revision', () => {
    const skills = SkillAnalysisEngine.evaluateSkillMastery([
      { skillId: 's1', skillName: 'Algebra', score: 45, totalAttempts: 10 },
      {
        skillId: 's2',
        skillName: 'Geometry',
        score: 90,
        totalAttempts: 25,
        lastAttemptDate: new Date('2026-01-01'),
      },
    ]);

    expect(skills[0].needsRevision).toBe(true);
    expect(skills[0].masteryLevel).toBe(45);
  });

  test('RecommendationEngine generates prioritized next steps', () => {
    const skillProgress = [
      new SkillProgress({
        skillId: 's1',
        skillName: 'Algebra',
        masteryLevel: 45,
        confidenceScore: 0.5,
        needsRevision: true,
      }),
      new SkillProgress({
        skillId: 's2',
        skillName: 'Physics',
        masteryLevel: 80,
        confidenceScore: 0.8,
        needsRevision: false,
      }),
    ];

    const recs = RecommendationEngine.generateSmartNextSteps({
      studentId: 'stud-1',
      skillProgress,
      readinessScore: 65,
    });

    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].priority).toBe('HIGH');
  });

  test('DailyTaskEngine converts recommendations to daily tasks', () => {
    const skillProgress = [
      new SkillProgress({
        skillId: 's1',
        skillName: 'Algebra',
        masteryLevel: 45,
        confidenceScore: 0.5,
        needsRevision: true,
      }),
    ];

    const recs = RecommendationEngine.generateSmartNextSteps({
      studentId: 'stud-1',
      skillProgress,
      readinessScore: 65,
    });

    const tasks = DailyTaskEngine.generateDailyTasks({
      planId: 'plan-1',
      dailyGoalMinutes: 60,
      recommendations: recs,
    });

    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0].planId).toBe('plan-1');
  });

  test('WeeklyPlannerEngine builds 7-day schedule', () => {
    const skillProgress = [
      new SkillProgress({
        skillId: 's1',
        skillName: 'Algebra',
        masteryLevel: 45,
        confidenceScore: 0.5,
        needsRevision: true,
      }),
    ];

    const weekly = WeeklyPlannerEngine.buildWeeklyPlan({
      planId: 'plan-1',
      studentId: 'stud-1',
      weekStartDate: new Date('2026-07-20'),
      dailyGoalMinutes: 60,
      skillProgress,
    });

    expect(weekly.dailyPlans.length).toBe(7);
    expect(weekly.targetMinutes).toBe(420);
  });

  test('RevisionEngine generates urgent revision recommendations', () => {
    const skillProgress = [
      new SkillProgress({
        skillId: 's1',
        skillName: 'Algebra',
        masteryLevel: 45,
        confidenceScore: 0.5,
        needsRevision: true,
      }),
      new SkillProgress({
        skillId: 's2',
        skillName: 'Calculus',
        masteryLevel: 62,
        confidenceScore: 0.6,
        needsRevision: true,
      }),
    ];

    const revisions = RevisionEngine.generateRevisionRecommendations({
      studentId: 'stud-1',
      skillProgress,
    });

    expect(revisions.length).toBe(2);
    expect(revisions[0].urgency).toBe('HIGH');
  });
});
