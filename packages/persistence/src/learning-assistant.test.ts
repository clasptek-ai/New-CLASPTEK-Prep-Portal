import { describe, test, expect, beforeEach } from 'vitest';
import {
  PostgresLearningPlanRepository,
  PostgresLearningTaskRepository,
  PostgresRevisionRepository,
} from './index';
import {
  LearningPlan,
  LearningTask,
  RevisionRecommendation,
} from '@clasptek/domain-learning-assistant';

class MockDatabasePool {
  private tables: Record<string, any[]> = {
    learning_plans: [],
    learning_tasks: [],
    revision_recommendations: [],
  };

  getPool() {
    return {
      query: async (sql: string, params?: any[]) => {
        if (sql.includes('INSERT INTO learning_plans')) {
          const id = params![0];
          const existingIdx = this.tables.learning_plans.findIndex((r) => r.id === id);
          const row = {
            id: params![0],
            student_id: params![1],
            target_score: params![2],
            target_date: params![3],
            status: params![4],
            daily_goal_minutes: params![5],
            total_tasks_generated: params![6],
            completed_tasks_count: params![7],
            created_at: params![8],
            updated_at: params![9],
          };
          if (existingIdx >= 0) {
            this.tables.learning_plans[existingIdx] = row;
          } else {
            this.tables.learning_plans.push(row);
          }
          return { rows: [] };
        }

        if (sql.includes('SELECT * FROM learning_plans WHERE student_id = $1')) {
          const studentId = params![0];
          const rows = this.tables.learning_plans.filter(
            (r) => r.student_id === studentId && r.status === 'ACTIVE'
          );
          return { rows };
        }

        if (sql.includes('SELECT * FROM learning_plans WHERE id = $1')) {
          const id = params![0];
          const rows = this.tables.learning_plans.filter((r) => r.id === id);
          return { rows };
        }

        if (sql.includes('INSERT INTO learning_tasks')) {
          const id = params![0];
          const existingIdx = this.tables.learning_tasks.findIndex((r) => r.id === id);
          const row = {
            id: params![0],
            plan_id: params![1],
            title: params![2],
            description: params![3],
            task_type: params![4],
            skill_id: params![5],
            priority: params![6],
            estimated_minutes: params![7],
            actual_minutes: params![8],
            status: params![9],
            completed_at: params![10],
            created_at: params![11],
          };
          if (existingIdx >= 0) {
            this.tables.learning_tasks[existingIdx] = row;
          } else {
            this.tables.learning_tasks.push(row);
          }
          return { rows: [] };
        }

        if (sql.includes('SELECT * FROM learning_tasks WHERE plan_id = $1')) {
          const planId = params![0];
          const rows = this.tables.learning_tasks.filter((r) => r.plan_id === planId);
          return { rows };
        }

        if (sql.includes('FROM learning_tasks t')) {
          const studentId = params![0];
          const plans = this.tables.learning_plans.filter((p) => p.student_id === studentId);
          const planIds = plans.map((p) => p.id);
          const rows = this.tables.learning_tasks.filter((t) => planIds.includes(t.plan_id));
          return { rows };
        }

        if (sql.includes('SELECT * FROM learning_tasks WHERE id = $1')) {
          const id = params![0];
          const rows = this.tables.learning_tasks.filter((r) => r.id === id);
          return { rows };
        }

        if (sql.includes('INSERT INTO revision_recommendations')) {
          const id = params![0];
          const existingIdx = this.tables.revision_recommendations.findIndex((r) => r.id === id);
          const row = {
            id: params![0],
            student_id: params![1],
            skill_id: params![2],
            skill_name: params![3],
            current_mastery: params![4],
            urgency: params![5],
            recommended_action: params![6],
            reason: params![7],
            readiness_gain: params![8],
            created_at: params![9],
          };
          if (existingIdx >= 0) {
            this.tables.revision_recommendations[existingIdx] = row;
          } else {
            this.tables.revision_recommendations.push(row);
          }
          return { rows: [] };
        }

        if (sql.includes('SELECT * FROM revision_recommendations WHERE student_id = $1')) {
          const studentId = params![0];
          const rows = this.tables.revision_recommendations.filter(
            (r) => r.student_id === studentId
          );
          return { rows };
        }

        return { rows: [] };
      },
    };
  }
}

describe('Learning Assistant Postgres Repositories', () => {
  let dbPool: any;
  let planRepo: PostgresLearningPlanRepository;
  let taskRepo: PostgresLearningTaskRepository;
  let revisionRepo: PostgresRevisionRepository;

  beforeEach(() => {
    dbPool = new MockDatabasePool();
    planRepo = new PostgresLearningPlanRepository(dbPool);
    taskRepo = new PostgresLearningTaskRepository(dbPool);
    revisionRepo = new PostgresRevisionRepository(dbPool);
  });

  test('PostgresLearningPlanRepository save and findByStudentId', async () => {
    const plan = new LearningPlan({
      id: 'plan-1',
      studentId: 'stud-1',
      targetScore: 85,
      targetDate: new Date('2026-12-31'),
      status: 'ACTIVE',
      dailyGoalMinutes: 60,
      totalTasksGenerated: 5,
      completedTasksCount: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await planRepo.save(plan);
    const found = await planRepo.findByStudentId('stud-1');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('plan-1');
    expect(found?.targetScore).toBe(85);
  });

  test('PostgresLearningTaskRepository save and findByPlanId', async () => {
    const task = new LearningTask({
      id: 'task-1',
      planId: 'plan-1',
      title: 'Practice Functions',
      description: 'Solve 5 problems',
      taskType: 'PRACTICE_DRILL',
      priority: 'HIGH',
      estimatedMinutes: 30,
      status: 'PENDING',
      createdAt: new Date(),
    });

    await taskRepo.save(task);
    const tasks = await taskRepo.findByPlanId('plan-1');
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Practice Functions');
  });

  test('PostgresRevisionRepository saveRecommendations and findByStudentId', async () => {
    const rec = new RevisionRecommendation({
      id: 'rev-1',
      studentId: 'stud-1',
      skillId: 'sk-1',
      skillName: 'Algebra',
      currentMastery: 45,
      urgency: 'HIGH',
      recommendedAction: 'Practice drill',
      reason: 'Low score',
      readinessGain: 3.5,
      createdAt: new Date(),
    });

    await revisionRepo.saveRecommendations([rec]);
    const recs = await revisionRepo.findByStudentId('stud-1');
    expect(recs.length).toBe(1);
    expect(recs[0].skillName).toBe('Algebra');
  });
});
