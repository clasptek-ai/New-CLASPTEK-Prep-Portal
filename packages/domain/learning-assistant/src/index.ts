import { Entity, AggregateRoot, ValueObject } from '@clasptek/kernel';

// ═══════════════════════════════════════════════════════════════════════
// VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════════

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export class StudyDuration extends ValueObject<{ minutes: number }> {
  constructor(minutes: number) {
    if (minutes < 0 || minutes > 720) {
      throw new Error('Study duration must be between 0 and 720 minutes.');
    }
    super({ minutes });
  }

  get minutes(): number {
    return this.props.minutes;
  }
}

export class ReadinessGain extends ValueObject<{ points: number }> {
  constructor(points: number) {
    if (points < 0 || points > 100) {
      throw new Error('Readiness gain points must be between 0 and 100.');
    }
    super({ points: Math.round(points * 100) / 100 });
  }

  get points(): number {
    return this.props.points;
  }
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export type RecommendationType =
  'WEAKNESS_REMEDIATION' | 'REVISION' | 'PRACTICE_DRILL' | 'MOCK_EXAM_PREP' | 'STREAK_MAINTENANCE';

export class LearningProgress extends ValueObject<{ percentage: number }> {
  constructor(percentage: number) {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Learning progress percentage must be between 0 and 100.');
    }
    super({ percentage: Math.round(percentage * 100) / 100 });
  }

  get percentage(): number {
    return this.props.percentage;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ENTITIES & AGGREGATES
// ═══════════════════════════════════════════════════════════════════════

export interface LearningTaskProps {
  id: string;
  planId: string;
  title: string;
  description: string;
  taskType: RecommendationType;
  skillId?: string | undefined;
  priority: Priority;
  estimatedMinutes: number;
  actualMinutes?: number | undefined;
  status: TaskStatus;
  completedAt?: Date | undefined;
  createdAt: Date;
}

export class LearningTask extends Entity<string> {
  public readonly planId: string;
  public readonly title: string;
  public readonly description: string;
  public readonly taskType: RecommendationType;
  public readonly skillId?: string | undefined;
  public readonly priority: Priority;
  public readonly estimatedMinutes: number;
  public actualMinutes?: number | undefined;
  public status: TaskStatus;
  public completedAt?: Date | undefined;
  public readonly createdAt: Date;

  constructor(props: LearningTaskProps) {
    super(props.id);
    this.planId = props.planId;
    this.title = props.title;
    this.description = props.description;
    this.taskType = props.taskType;
    this.skillId = props.skillId;
    this.priority = props.priority;
    this.estimatedMinutes = props.estimatedMinutes;
    this.actualMinutes = props.actualMinutes;
    this.status = props.status;
    this.completedAt = props.completedAt;
    this.createdAt = props.createdAt;
  }

  complete(actualMinutes?: number): void {
    this.status = 'COMPLETED';
    this.actualMinutes = actualMinutes ?? this.estimatedMinutes;
    this.completedAt = new Date();
  }
}

export interface LearningPlanProps {
  id: string;
  studentId: string;
  targetScore: number;
  targetDate: Date;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  dailyGoalMinutes: number;
  totalTasksGenerated: number;
  completedTasksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class LearningPlan extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly targetScore: number;
  public readonly targetDate: Date;
  public status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  public dailyGoalMinutes: number;
  public totalTasksGenerated: number;
  public completedTasksCount: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: LearningPlanProps) {
    super(props.id);
    this.studentId = props.studentId;
    this.targetScore = props.targetScore;
    this.targetDate = props.targetDate;
    this.status = props.status;
    this.dailyGoalMinutes = props.dailyGoalMinutes;
    this.totalTasksGenerated = props.totalTasksGenerated;
    this.completedTasksCount = props.completedTasksCount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  incrementTaskCount(count: number = 1): void {
    this.totalTasksGenerated += count;
    this.updatedAt = new Date();
  }

  recordTaskCompletion(): void {
    this.completedTasksCount += 1;
    this.updatedAt = new Date();
  }

  get progressPercentage(): number {
    if (this.totalTasksGenerated === 0) return 0;
    return Math.round((this.completedTasksCount / this.totalTasksGenerated) * 100);
  }
}

export interface DailyStudyPlanProps {
  id: string;
  planId: string;
  studentId: string;
  date: Date;
  tasks: LearningTask[];
  targetMinutes: number;
  completedMinutes: number;
  isCompleted: boolean;
}

export class DailyStudyPlan extends Entity<string> {
  public readonly planId: string;
  public readonly studentId: string;
  public readonly date: Date;
  public readonly tasks: LearningTask[];
  public readonly targetMinutes: number;
  public completedMinutes: number;
  public isCompleted: boolean;

  constructor(props: DailyStudyPlanProps) {
    super(props.id);
    this.planId = props.planId;
    this.studentId = props.studentId;
    this.date = props.date;
    this.tasks = props.tasks;
    this.targetMinutes = props.targetMinutes;
    this.completedMinutes = props.completedMinutes;
    this.isCompleted = props.isCompleted;
  }
}

export interface WeeklyStudyPlanProps {
  id: string;
  planId: string;
  studentId: string;
  weekStartDate: Date;
  dailyPlans: DailyStudyPlan[];
  weeklyFocusSkills: string[];
  targetMinutes: number;
  completedMinutes: number;
}

export class WeeklyStudyPlan extends Entity<string> {
  public readonly planId: string;
  public readonly studentId: string;
  public readonly weekStartDate: Date;
  public readonly dailyPlans: DailyStudyPlan[];
  public readonly weeklyFocusSkills: string[];
  public readonly targetMinutes: number;
  public completedMinutes: number;

  constructor(props: WeeklyStudyPlanProps) {
    super(props.id);
    this.planId = props.planId;
    this.studentId = props.studentId;
    this.weekStartDate = props.weekStartDate;
    this.dailyPlans = props.dailyPlans;
    this.weeklyFocusSkills = props.weeklyFocusSkills;
    this.targetMinutes = props.targetMinutes;
    this.completedMinutes = props.completedMinutes;
  }
}

export interface StudyRecommendationProps {
  id: string;
  studentId: string;
  recommendationType: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
  readinessGain: number;
  estimatedMinutes: number;
  createdAt: Date;
}

export class StudyRecommendation extends Entity<string> {
  public readonly studentId: string;
  public readonly recommendationType: RecommendationType;
  public readonly title: string;
  public readonly description: string;
  public readonly priority: Priority;
  public readonly readinessGain: number;
  public readonly estimatedMinutes: number;
  public readonly createdAt: Date;

  constructor(props: StudyRecommendationProps) {
    super(props.id);
    this.studentId = props.studentId;
    this.recommendationType = props.recommendationType;
    this.title = props.title;
    this.description = props.description;
    this.priority = props.priority;
    this.readinessGain = props.readinessGain;
    this.estimatedMinutes = props.estimatedMinutes;
    this.createdAt = props.createdAt;
  }
}

export interface RevisionRecommendationProps {
  id: string;
  studentId: string;
  skillId: string;
  skillName: string;
  currentMastery: number;
  urgency: Priority;
  recommendedAction: string;
  reason: string;
  readinessGain: number;
  createdAt: Date;
}

export class RevisionRecommendation extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly skillId: string;
  public readonly skillName: string;
  public currentMastery: number;
  public urgency: Priority;
  public recommendedAction: string;
  public reason: string;
  public readinessGain: number;
  public readonly createdAt: Date;

  constructor(props: RevisionRecommendationProps) {
    super(props.id);
    this.studentId = props.studentId;
    this.skillId = props.skillId;
    this.skillName = props.skillName;
    this.currentMastery = props.currentMastery;
    this.urgency = props.urgency;
    this.recommendedAction = props.recommendedAction;
    this.reason = props.reason;
    this.readinessGain = props.readinessGain;
    this.createdAt = props.createdAt;
  }
}

export interface SkillProgressProps {
  skillId: string;
  skillName: string;
  masteryLevel: number;
  confidenceScore: number;
  lastPracticedAt?: Date | undefined;
  needsRevision: boolean;
}

export class SkillProgress extends Entity<string> {
  public readonly skillId: string;
  public readonly skillName: string;
  public masteryLevel: number;
  public confidenceScore: number;
  public lastPracticedAt?: Date | undefined;
  public needsRevision: boolean;

  constructor(props: SkillProgressProps) {
    super(props.skillId);
    this.skillId = props.skillId;
    this.skillName = props.skillName;
    this.masteryLevel = props.masteryLevel;
    this.confidenceScore = props.confidenceScore;
    this.lastPracticedAt = props.lastPracticedAt;
    this.needsRevision = props.needsRevision;
  }
}

export interface LearningMilestoneProps {
  id: string;
  studentId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  achievedAt?: Date | undefined;
  isAchieved: boolean;
}

export class LearningMilestone extends Entity<string> {
  public readonly studentId: string;
  public readonly title: string;
  public readonly targetValue: number;
  public currentValue: number;
  public achievedAt?: Date | undefined;
  public isAchieved: boolean;

  constructor(props: LearningMilestoneProps) {
    super(props.id);
    this.studentId = props.studentId;
    this.title = props.title;
    this.targetValue = props.targetValue;
    this.currentValue = props.currentValue;
    this.achievedAt = props.achievedAt;
    this.isAchieved = props.isAchieved;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// DOMAIN ENGINES (PURE DETERMINISTIC BUSINESS LOGIC)
// ═══════════════════════════════════════════════════════════════════════

export class LearningPlanningEngine {
  public static calculatePlanParameters(input: {
    currentReadiness: number;
    targetScore: number;
    daysUntilExam: number;
    preferredDailyMinutes?: number | undefined;
  }): { dailyGoalMinutes: number; recommendedTaskCountPerDay: number; intensityLevel: string } {
    const readinessDeficit = Math.max(0, input.targetScore - input.currentReadiness);
    const safeDays = Math.max(1, input.daysUntilExam);

    const totalRequiredMinutes = readinessDeficit * 120;
    const baseDailyMinutes = Math.ceil(totalRequiredMinutes / safeDays);
    const dailyGoalMinutes = Math.min(
      360,
      Math.max(30, input.preferredDailyMinutes ?? baseDailyMinutes)
    );

    let intensityLevel = 'MODERATE';
    if (dailyGoalMinutes >= 180 || safeDays <= 14) {
      intensityLevel = 'HIGH';
    } else if (dailyGoalMinutes <= 45 && safeDays >= 60) {
      intensityLevel = 'LIGHT';
    }

    const recommendedTaskCountPerDay = Math.min(8, Math.max(2, Math.round(dailyGoalMinutes / 30)));

    return {
      dailyGoalMinutes,
      recommendedTaskCountPerDay,
      intensityLevel,
    };
  }
}

export class SkillAnalysisEngine {
  public static evaluateSkillMastery(
    skills: Array<{
      skillId: string;
      skillName: string;
      score: number;
      totalAttempts: number;
      lastAttemptDate?: Date;
    }>
  ): SkillProgress[] {
    const now = new Date();
    return skills.map((s) => {
      const daysSinceLast = s.lastAttemptDate
        ? Math.floor((now.getTime() - new Date(s.lastAttemptDate).getTime()) / (1000 * 3600 * 24))
        : 999;

      const masteryLevel = Math.min(100, Math.max(0, Math.round(s.score)));
      const confidenceScore = Math.min(1.0, s.totalAttempts / 20);

      const needsRevision = masteryLevel < 70 || daysSinceLast >= 14;

      return new SkillProgress({
        skillId: s.skillId,
        skillName: s.skillName,
        masteryLevel,
        confidenceScore,
        lastPracticedAt: s.lastAttemptDate ? new Date(s.lastAttemptDate) : undefined,
        needsRevision,
      });
    });
  }
}

export class RecommendationEngine {
  public static generateSmartNextSteps(input: {
    studentId: string;
    skillProgress: SkillProgress[];
    readinessScore: number;
    recentMockScore?: number;
  }): StudyRecommendation[] {
    const recommendations: StudyRecommendation[] = [];
    const weakSkills = input.skillProgress.filter((s) => s.masteryLevel < 70);

    weakSkills.slice(0, 3).forEach((skill, idx) => {
      recommendations.push(
        new StudyRecommendation({
          id: `rec-weak-${skill.skillId}-${Date.now()}-${idx}`,
          studentId: input.studentId,
          recommendationType: 'WEAKNESS_REMEDIATION',
          title: `Remediate Weak Skill: ${skill.skillName}`,
          description: `Mastery is currently ${skill.masteryLevel}%. Practice targeted drills to boost readiness.`,
          priority: skill.masteryLevel < 50 ? 'HIGH' : 'MEDIUM',
          readinessGain: Math.round((70 - skill.masteryLevel) * 0.15 * 10) / 10,
          estimatedMinutes: 30,
          createdAt: new Date(),
        })
      );
    });

    const dormantSkills = input.skillProgress.filter(
      (s) => s.needsRevision && s.masteryLevel >= 70
    );
    dormantSkills.slice(0, 2).forEach((skill, idx) => {
      recommendations.push(
        new StudyRecommendation({
          id: `rec-rev-${skill.skillId}-${Date.now()}-${idx}`,
          studentId: input.studentId,
          recommendationType: 'REVISION',
          title: `Revise Skill: ${skill.skillName}`,
          description: `Skill has not been practiced recently. Quick revision recommended to retain mastery.`,
          priority: 'MEDIUM',
          readinessGain: 1.5,
          estimatedMinutes: 20,
          createdAt: new Date(),
        })
      );
    });

    if (input.readinessScore >= 75) {
      recommendations.push(
        new StudyRecommendation({
          id: `rec-mock-${Date.now()}`,
          studentId: input.studentId,
          recommendationType: 'MOCK_EXAM_PREP',
          title: 'Full-Length Mock Examination',
          description: 'Your readiness is high! Take a timed mock exam to validate readiness.',
          priority: 'HIGH',
          readinessGain: 3.5,
          estimatedMinutes: 120,
          createdAt: new Date(),
        })
      );
    } else {
      recommendations.push(
        new StudyRecommendation({
          id: `rec-drill-${Date.now()}`,
          studentId: input.studentId,
          recommendationType: 'PRACTICE_DRILL',
          title: 'Adaptive Practice Session',
          description:
            'Complete a 15-question adaptive practice session to strengthen overall domain mastery.',
          priority: 'MEDIUM',
          readinessGain: 2.0,
          estimatedMinutes: 30,
          createdAt: new Date(),
        })
      );
    }

    return recommendations.sort((a, b) => {
      const prioOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return prioOrder[b.priority] - prioOrder[a.priority];
    });
  }
}

export class DailyTaskEngine {
  public static generateDailyTasks(input: {
    planId: string;
    dailyGoalMinutes: number;
    recommendations: StudyRecommendation[];
  }): LearningTask[] {
    const tasks: LearningTask[] = [];
    let allocatedMinutes = 0;
    let taskIndex = 1;

    for (const rec of input.recommendations) {
      if (allocatedMinutes + rec.estimatedMinutes > input.dailyGoalMinutes + 15) {
        break;
      }

      tasks.push(
        new LearningTask({
          id: `task-${input.planId}-${Date.now()}-${taskIndex++}`,
          planId: input.planId,
          title: rec.title,
          description: rec.description,
          taskType: rec.recommendationType,
          priority: rec.priority,
          estimatedMinutes: rec.estimatedMinutes,
          status: 'PENDING',
          createdAt: new Date(),
        })
      );

      allocatedMinutes += rec.estimatedMinutes;
    }

    if (tasks.length === 0) {
      tasks.push(
        new LearningTask({
          id: `task-${input.planId}-${Date.now()}-def`,
          planId: input.planId,
          title: 'Daily Core Practice Drill',
          description: '30-minute adaptive practice session for ongoing skill maintenance.',
          taskType: 'PRACTICE_DRILL',
          priority: 'MEDIUM',
          estimatedMinutes: Math.min(30, input.dailyGoalMinutes),
          status: 'PENDING',
          createdAt: new Date(),
        })
      );
    }

    return tasks;
  }
}

export class WeeklyPlannerEngine {
  public static buildWeeklyPlan(input: {
    planId: string;
    studentId: string;
    weekStartDate: Date;
    dailyGoalMinutes: number;
    skillProgress: SkillProgress[];
  }): WeeklyStudyPlan {
    const focusSkills = input.skillProgress
      .filter((s) => s.needsRevision)
      .slice(0, 5)
      .map((s) => s.skillName);

    const dailyPlans: DailyStudyPlan[] = [];
    const targetMinutes = input.dailyGoalMinutes * 7;

    for (let day = 0; day < 7; day++) {
      const date = new Date(input.weekStartDate);
      date.setDate(date.getDate() + day);

      dailyPlans.push(
        new DailyStudyPlan({
          id: `daily-plan-${input.planId}-${day}`,
          planId: input.planId,
          studentId: input.studentId,
          date,
          tasks: [],
          targetMinutes: input.dailyGoalMinutes,
          completedMinutes: 0,
          isCompleted: false,
        })
      );
    }

    return new WeeklyStudyPlan({
      id: `weekly-plan-${input.planId}-${input.weekStartDate.toISOString().split('T')[0]}`,
      planId: input.planId,
      studentId: input.studentId,
      weekStartDate: input.weekStartDate,
      dailyPlans,
      weeklyFocusSkills: focusSkills.length > 0 ? focusSkills : ['General Domain Practice'],
      targetMinutes,
      completedMinutes: 0,
    });
  }
}

export class RevisionEngine {
  public static generateRevisionRecommendations(input: {
    studentId: string;
    skillProgress: SkillProgress[];
  }): RevisionRecommendation[] {
    const revisions: RevisionRecommendation[] = [];

    input.skillProgress
      .filter((s) => s.needsRevision)
      .forEach((skill, idx) => {
        let urgency: Priority = 'LOW';
        if (skill.masteryLevel < 50) {
          urgency = 'HIGH';
        } else if (skill.masteryLevel < 70) {
          urgency = 'MEDIUM';
        }

        revisions.push(
          new RevisionRecommendation({
            id: `rev-rec-${skill.skillId}-${Date.now()}-${idx}`,
            studentId: input.studentId,
            skillId: skill.skillId,
            skillName: skill.skillName,
            currentMastery: skill.masteryLevel,
            urgency,
            recommendedAction: `Complete 10 focused practice questions on ${skill.skillName}`,
            reason: `Mastery score is ${skill.masteryLevel}%, below target proficiency threshold.`,
            readinessGain: Math.round((70 - skill.masteryLevel) * 0.1 * 10) / 10,
            createdAt: new Date(),
          })
        );
      });

    return revisions.sort((a, b) => a.currentMastery - b.currentMastery);
  }
}
