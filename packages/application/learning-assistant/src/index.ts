import {
  LearningPlan,
  LearningTask,
  WeeklyStudyPlan,
  RevisionRecommendation,
  SkillProgress,
  LearningPlanningEngine,
  SkillAnalysisEngine,
  RecommendationEngine,
  DailyTaskEngine,
  WeeklyPlannerEngine,
  RevisionEngine,
} from '@clasptek/domain-learning-assistant';

// ═══════════════════════════════════════════════════════════════════════
// REPOSITORY CONTRACTS
// ═══════════════════════════════════════════════════════════════════════

export interface LearningPlanRepository {
  save(plan: LearningPlan): Promise<void>;
  findByStudentId(studentId: string): Promise<LearningPlan | null>;
  findById(id: string): Promise<LearningPlan | null>;
}

export interface LearningTaskRepository {
  save(task: LearningTask): Promise<void>;
  saveAll(tasks: LearningTask[]): Promise<void>;
  findByPlanId(planId: string): Promise<LearningTask[]>;
  findDailyTasks(studentId: string, date: Date): Promise<LearningTask[]>;
  findById(id: string): Promise<LearningTask | null>;
}

export interface RevisionRepository {
  saveRecommendations(recs: RevisionRecommendation[]): Promise<void>;
  findByStudentId(studentId: string): Promise<RevisionRecommendation[]>;
}

// ═══════════════════════════════════════════════════════════════════════
// COMMANDS & HANDLERS
// ═══════════════════════════════════════════════════════════════════════

export interface GenerateLearningPlanCommand {
  studentId: string;
  targetScore: number;
  targetDate: Date;
  dailyGoalMinutes?: number;
  currentReadiness?: number;
  skillData?: Array<{
    skillId: string;
    skillName: string;
    score: number;
    totalAttempts: number;
    lastAttemptDate?: Date;
  }>;
}

export class GenerateLearningPlanHandler {
  constructor(
    private readonly planRepo: LearningPlanRepository,
    private readonly taskRepo: LearningTaskRepository
  ) {}

  async execute(cmd: GenerateLearningPlanCommand): Promise<LearningPlan> {
    const daysUntilExam = Math.max(
      1,
      Math.ceil((new Date(cmd.targetDate).getTime() - Date.now()) / (1000 * 3600 * 24))
    );
    const currentReadiness = cmd.currentReadiness ?? 65;

    const params = LearningPlanningEngine.calculatePlanParameters({
      currentReadiness,
      targetScore: cmd.targetScore,
      daysUntilExam,
      preferredDailyMinutes: cmd.dailyGoalMinutes,
    });

    const plan = new LearningPlan({
      id: `plan-${cmd.studentId}-${Date.now()}`,
      studentId: cmd.studentId,
      targetScore: cmd.targetScore,
      targetDate: new Date(cmd.targetDate),
      status: 'ACTIVE',
      dailyGoalMinutes: params.dailyGoalMinutes,
      totalTasksGenerated: 0,
      completedTasksCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const skillProgress = SkillAnalysisEngine.evaluateSkillMastery(
      cmd.skillData ?? [
        { skillId: 's1', skillName: 'Algebra & Functions', score: 55, totalAttempts: 12 },
        { skillId: 's2', skillName: 'Geometry & Measurement', score: 75, totalAttempts: 18 },
        { skillId: 's3', skillName: 'Data Analysis & Statistics', score: 60, totalAttempts: 8 },
      ]
    );

    const recs = RecommendationEngine.generateSmartNextSteps({
      studentId: cmd.studentId,
      skillProgress,
      readinessScore: currentReadiness,
    });

    const tasks = DailyTaskEngine.generateDailyTasks({
      planId: plan.id,
      dailyGoalMinutes: params.dailyGoalMinutes,
      recommendations: recs,
    });

    plan.incrementTaskCount(tasks.length);
    await this.planRepo.save(plan);
    await this.taskRepo.saveAll(tasks);

    return plan;
  }
}

export interface GenerateDailyTasksCommand {
  studentId: string;
  date?: Date;
  currentReadiness?: number;
  skillData?: Array<{
    skillId: string;
    skillName: string;
    score: number;
    totalAttempts: number;
    lastAttemptDate?: Date;
  }>;
}

export class GenerateDailyTasksHandler {
  constructor(
    private readonly planRepo: LearningPlanRepository,
    private readonly taskRepo: LearningTaskRepository
  ) {}

  async execute(cmd: GenerateDailyTasksCommand): Promise<LearningTask[]> {
    let plan = await this.planRepo.findByStudentId(cmd.studentId);
    if (!plan) {
      const planGen = new GenerateLearningPlanHandler(this.planRepo, this.taskRepo);
      plan = await planGen.execute({
        studentId: cmd.studentId,
        targetScore: 80,
        targetDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      });
    }

    const skillProgress = SkillAnalysisEngine.evaluateSkillMastery(
      cmd.skillData ?? [
        { skillId: 's1', skillName: 'Algebra & Functions', score: 55, totalAttempts: 12 },
        { skillId: 's2', skillName: 'Geometry & Measurement', score: 75, totalAttempts: 18 },
      ]
    );

    const recs = RecommendationEngine.generateSmartNextSteps({
      studentId: cmd.studentId,
      skillProgress,
      readinessScore: cmd.currentReadiness ?? 65,
    });

    const tasks = DailyTaskEngine.generateDailyTasks({
      planId: plan.id,
      dailyGoalMinutes: plan.dailyGoalMinutes,
      recommendations: recs,
    });

    plan.incrementTaskCount(tasks.length);
    await this.planRepo.save(plan);
    await this.taskRepo.saveAll(tasks);

    return tasks;
  }
}

export interface CompleteLearningTaskCommand {
  taskId: string;
  actualMinutes?: number;
}

export class CompleteLearningTaskHandler {
  constructor(
    private readonly planRepo: LearningPlanRepository,
    private readonly taskRepo: LearningTaskRepository
  ) {}

  async execute(cmd: CompleteLearningTaskCommand): Promise<LearningTask> {
    const task = await this.taskRepo.findById(cmd.taskId);
    if (!task) {
      throw new Error(`Learning task with ID ${cmd.taskId} not found.`);
    }

    task.complete(cmd.actualMinutes);
    await this.taskRepo.save(task);

    const plan = await this.planRepo.findById(task.planId);
    if (plan) {
      plan.recordTaskCompletion();
      await this.planRepo.save(plan);
    }

    return task;
  }
}

export interface GenerateRevisionRecommendationsCommand {
  studentId: string;
  skillData?: Array<{
    skillId: string;
    skillName: string;
    score: number;
    totalAttempts: number;
    lastAttemptDate?: Date;
  }>;
}

export class GenerateRevisionRecommendationsHandler {
  constructor(private readonly revisionRepo: RevisionRepository) {}

  async execute(cmd: GenerateRevisionRecommendationsCommand): Promise<RevisionRecommendation[]> {
    const skillProgress = SkillAnalysisEngine.evaluateSkillMastery(
      cmd.skillData ?? [
        { skillId: 's1', skillName: 'Algebra & Functions', score: 55, totalAttempts: 12 },
        { skillId: 's3', skillName: 'Data Analysis & Statistics', score: 62, totalAttempts: 8 },
      ]
    );

    const revisions = RevisionEngine.generateRevisionRecommendations({
      studentId: cmd.studentId,
      skillProgress,
    });

    await this.revisionRepo.saveRecommendations(revisions);
    return revisions;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// QUERIES & HANDLERS
// ═══════════════════════════════════════════════════════════════════════

export interface GetLearningPlanQuery {
  studentId: string;
}
export class GetLearningPlanHandler {
  constructor(private readonly planRepo: LearningPlanRepository) {}
  async execute(query: GetLearningPlanQuery): Promise<LearningPlan | null> {
    return this.planRepo.findByStudentId(query.studentId);
  }
}

export interface GetDailyTasksQuery {
  studentId: string;
  date?: Date;
}
export class GetDailyTasksHandler {
  constructor(private readonly taskRepo: LearningTaskRepository) {}
  async execute(query: GetDailyTasksQuery): Promise<LearningTask[]> {
    return this.taskRepo.findDailyTasks(query.studentId, query.date ?? new Date());
  }
}

export interface GetWeeklyPlanQuery {
  studentId: string;
  weekStartDate?: Date;
  skillData?: Array<{
    skillId: string;
    skillName: string;
    score: number;
    totalAttempts: number;
    lastAttemptDate?: Date;
  }>;
}
export class GetWeeklyPlanHandler {
  constructor(private readonly planRepo: LearningPlanRepository) {}

  async execute(query: GetWeeklyPlanQuery): Promise<WeeklyStudyPlan> {
    const plan = await this.planRepo.findByStudentId(query.studentId);
    const dailyGoalMinutes = plan ? plan.dailyGoalMinutes : 60;
    const planId = plan ? plan.id : `plan-${query.studentId}`;
    const weekStartDate = query.weekStartDate ?? new Date();

    const skillProgress = SkillAnalysisEngine.evaluateSkillMastery(
      query.skillData ?? [
        { skillId: 's1', skillName: 'Algebra & Functions', score: 55, totalAttempts: 12 },
      ]
    );

    return WeeklyPlannerEngine.buildWeeklyPlan({
      planId,
      studentId: query.studentId,
      weekStartDate,
      dailyGoalMinutes,
      skillProgress,
    });
  }
}

export interface GetRevisionRecommendationsQuery {
  studentId: string;
}
export class GetRevisionRecommendationsHandler {
  constructor(private readonly revisionRepo: RevisionRepository) {}
  async execute(query: GetRevisionRecommendationsQuery): Promise<RevisionRecommendation[]> {
    return this.revisionRepo.findByStudentId(query.studentId);
  }
}

export interface GetSkillAnalysisQuery {
  studentId: string;
  skillData?: Array<{
    skillId: string;
    skillName: string;
    score: number;
    totalAttempts: number;
    lastAttemptDate?: Date;
  }>;
}
export class GetSkillAnalysisHandler {
  async execute(query: GetSkillAnalysisQuery): Promise<SkillProgress[]> {
    return SkillAnalysisEngine.evaluateSkillMastery(
      query.skillData ?? [
        { skillId: 's1', skillName: 'Algebra & Functions', score: 55, totalAttempts: 12 },
        { skillId: 's2', skillName: 'Geometry & Measurement', score: 78, totalAttempts: 18 },
        { skillId: 's3', skillName: 'Data Analysis & Statistics', score: 62, totalAttempts: 8 },
      ]
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════
// LEARNING ASSISTANT ORCHESTRATOR FACADE
// ═══════════════════════════════════════════════════════════════════════

export class LearningAssistantOrchestrator {
  private readonly genPlanHandler: GenerateLearningPlanHandler;
  private readonly genDailyTasksHandler: GenerateDailyTasksHandler;
  private readonly completeTaskHandler: CompleteLearningTaskHandler;
  private readonly genRevisionHandler: GenerateRevisionRecommendationsHandler;
  private readonly getPlanHandler: GetLearningPlanHandler;
  private readonly getDailyTasksHandler: GetDailyTasksHandler;
  private readonly getWeeklyPlanHandler: GetWeeklyPlanHandler;
  private readonly getRevisionHandler: GetRevisionRecommendationsHandler;
  private readonly getSkillAnalysisHandler: GetSkillAnalysisHandler;

  constructor(
    planRepo: LearningPlanRepository,
    taskRepo: LearningTaskRepository,
    revisionRepo: RevisionRepository
  ) {
    this.genPlanHandler = new GenerateLearningPlanHandler(planRepo, taskRepo);
    this.genDailyTasksHandler = new GenerateDailyTasksHandler(planRepo, taskRepo);
    this.completeTaskHandler = new CompleteLearningTaskHandler(planRepo, taskRepo);
    this.genRevisionHandler = new GenerateRevisionRecommendationsHandler(revisionRepo);

    this.getPlanHandler = new GetLearningPlanHandler(planRepo);
    this.getDailyTasksHandler = new GetDailyTasksHandler(taskRepo);
    this.getWeeklyPlanHandler = new GetWeeklyPlanHandler(planRepo);
    this.getRevisionHandler = new GetRevisionRecommendationsHandler(revisionRepo);
    this.getSkillAnalysisHandler = new GetSkillAnalysisHandler();
  }

  async generatePlan(cmd: GenerateLearningPlanCommand): Promise<LearningPlan> {
    return this.genPlanHandler.execute(cmd);
  }

  async generateDailyTasks(cmd: GenerateDailyTasksCommand): Promise<LearningTask[]> {
    return this.genDailyTasksHandler.execute(cmd);
  }

  async completeTask(cmd: CompleteLearningTaskCommand): Promise<LearningTask> {
    return this.completeTaskHandler.execute(cmd);
  }

  async generateRevisionRecommendations(
    cmd: GenerateRevisionRecommendationsCommand
  ): Promise<RevisionRecommendation[]> {
    return this.genRevisionHandler.execute(cmd);
  }

  async getPlan(studentId: string): Promise<LearningPlan | null> {
    return this.getPlanHandler.execute({ studentId });
  }

  async getDailyTasks(studentId: string, date?: Date): Promise<LearningTask[]> {
    return this.getDailyTasksHandler.execute(date ? { studentId, date } : { studentId });
  }

  async getWeeklyPlan(studentId: string, weekStartDate?: Date): Promise<WeeklyStudyPlan> {
    return this.getWeeklyPlanHandler.execute(
      weekStartDate ? { studentId, weekStartDate } : { studentId }
    );
  }

  async getRevisionRecommendations(studentId: string): Promise<RevisionRecommendation[]> {
    return this.getRevisionHandler.execute({ studentId });
  }

  async getSkillAnalysis(studentId: string): Promise<SkillProgress[]> {
    return this.getSkillAnalysisHandler.execute({ studentId });
  }
}
