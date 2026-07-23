import { describe, test, expect, beforeEach } from 'vitest';
import {
  LearningPlan,
  LearningTask,
  RevisionRecommendation,
} from '@clasptek/domain-learning-assistant';
import {
  LearningPlanRepository,
  LearningTaskRepository,
  RevisionRepository,
  LearningAssistantOrchestrator,
} from './index';

class InMemoryPlanRepo implements LearningPlanRepository {
  private plans = new Map<string, LearningPlan>();
  async save(plan: LearningPlan): Promise<void> {
    this.plans.set(plan.id, plan);
  }
  async findByStudentId(studentId: string): Promise<LearningPlan | null> {
    for (const p of this.plans.values()) {
      if (p.studentId === studentId) return p;
    }
    return null;
  }
  async findById(id: string): Promise<LearningPlan | null> {
    return this.plans.get(id) ?? null;
  }
}

class InMemoryTaskRepo implements LearningTaskRepository {
  private tasks = new Map<string, LearningTask>();
  async save(task: LearningTask): Promise<void> {
    this.tasks.set(task.id, task);
  }
  async saveAll(tasks: LearningTask[]): Promise<void> {
    tasks.forEach((t) => this.tasks.set(t.id, t));
  }
  async findByPlanId(planId: string): Promise<LearningTask[]> {
    return Array.from(this.tasks.values()).filter((t) => t.planId === planId);
  }
  async findDailyTasks(_studentId: string, _date: Date): Promise<LearningTask[]> {
    return Array.from(this.tasks.values());
  }
  async findById(id: string): Promise<LearningTask | null> {
    return this.tasks.get(id) ?? null;
  }
}

class InMemoryRevisionRepo implements RevisionRepository {
  private recs: RevisionRecommendation[] = [];
  async saveRecommendations(recs: RevisionRecommendation[]): Promise<void> {
    this.recs.push(...recs);
  }
  async findByStudentId(studentId: string): Promise<RevisionRecommendation[]> {
    return this.recs.filter((r) => r.studentId === studentId);
  }
}

describe('Application Learning Assistant Orchestrator', () => {
  let planRepo: InMemoryPlanRepo;
  let taskRepo: InMemoryTaskRepo;
  let revisionRepo: InMemoryRevisionRepo;
  let orchestrator: LearningAssistantOrchestrator;

  beforeEach(() => {
    planRepo = new InMemoryPlanRepo();
    taskRepo = new InMemoryTaskRepo();
    revisionRepo = new InMemoryRevisionRepo();
    orchestrator = new LearningAssistantOrchestrator(planRepo, taskRepo, revisionRepo);
  });

  test('generatePlan creates a new plan and daily tasks', async () => {
    const plan = await orchestrator.generatePlan({
      studentId: 'stud-1',
      targetScore: 85,
      targetDate: new Date('2026-10-30'),
      dailyGoalMinutes: 90,
    });

    expect(plan.studentId).toBe('stud-1');
    expect(plan.targetScore).toBe(85);
    expect(plan.totalTasksGenerated).toBeGreaterThan(0);

    const fetchedPlan = await orchestrator.getPlan('stud-1');
    expect(fetchedPlan?.id).toBe(plan.id);
  });

  test('generateDailyTasks creates daily tasks for student', async () => {
    const tasks = await orchestrator.generateDailyTasks({
      studentId: 'stud-1',
      currentReadiness: 70,
    });

    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0].status).toBe('PENDING');
  });

  test('completeTask updates task and plan progress', async () => {
    const tasks = await orchestrator.generateDailyTasks({ studentId: 'stud-1' });
    const taskId = tasks[0].id;

    const completed = await orchestrator.completeTask({ taskId, actualMinutes: 25 });
    expect(completed.status).toBe('COMPLETED');
    expect(completed.actualMinutes).toBe(25);

    const plan = await orchestrator.getPlan('stud-1');
    expect(plan?.completedTasksCount).toBe(1);
  });

  test('generateRevisionRecommendations yields urgent revision recommendations', async () => {
    const recs = await orchestrator.generateRevisionRecommendations({ studentId: 'stud-1' });
    expect(recs.length).toBeGreaterThan(0);

    const fetchedRecs = await orchestrator.getRevisionRecommendations('stud-1');
    expect(fetchedRecs.length).toBe(recs.length);
  });

  test('getSkillAnalysis returns evaluated skill progress', async () => {
    const skills = await orchestrator.getSkillAnalysis('stud-1');
    expect(skills.length).toBe(3);
    expect(skills[0].skillName).toBe('Algebra & Functions');
  });
});
