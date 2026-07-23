import { describe, test, expect, vi } from 'vitest';
import {
  PostgresProgrammeEnrollmentRepository,
  PostgresStudentLearningProfileRepository,
  PostgresReadinessRepository,
  PostgresInterventionRepository,
} from './index';
import {
  StudentProgrammeEnrollment,
  StudentLearningProfile,
  StudentProgress,
  StudentIntervention,
} from '@clasptek/domain-student-learning';

// Mock DB Pool
function mkMockDbPool() {
  const query = vi.fn(async (sql: string, params?: any[]) => {
    if (sql.includes('BEGIN') || sql.includes('COMMIT') || sql.includes('ROLLBACK')) {
      return { rows: [] };
    }
    if (sql.includes('student_learning_profiles')) {
      return {
        rows: [
          {
            id: 'prof-1',
            student_id: params?.[0] ?? 's-1',
            learning_pace: 'Accelerated',
            weekly_study_hours: '18.00',
            estimated_completion_date: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      };
    }
    if (sql.includes('student_progress')) {
      return {
        rows: [
          {
            id: 'prog-1',
            journey_id: 'j-1',
            student_id: 's-1',
            readiness_score: '75.00',
            readiness_level: 'NEARLY_READY',
            last_readiness_update: new Date(),
            created_at: new Date(),
          },
        ],
      };
    }
    if (sql.includes('student_interventions')) {
      return {
        rows: [
          {
            id: 'si-1',
            journey_id: 'j-1',
            student_id: 's-1',
            rule_code: 'RULE_NO_LOGIN_7D',
            intervention_type: 'INACTIVITY_ALERT',
            status: 'ACTIVE',
            title: '7 Days Inactivity',
            description: 'Inactive student',
            trigger_reason: 'No login',
            action_recommended: 'Notify Student',
            created_at: new Date(),
            resolved_at: null,
          },
        ],
      };
    }
    if (sql.includes('student_programme_enrollments')) {
      return {
        rows: [
          {
            id: 'enr-1',
            journey_id: 'j-1',
            student_id: 's-1',
            programme_id: 'p-1',
            programme_version_id: 'v-1',
            enrollment_status: 'ACTIVE',
            delivery_mode: 'ONLINE',
            payment_verified: true,
            target_exam_date: new Date('2026-10-18'),
            target_score: '7.5',
            exam_registration_status: 'CONFIRMED',
            lock_version: 0,
          },
        ],
      };
    }
    return { rows: [] };
  });

  const client = { query, release: vi.fn() };
  return {
    getPool: () => ({ query, connect: vi.fn().mockResolvedValue(client) }),
    query,
  };
}

describe('Student Learning Persistence Repositories Unit Tests', () => {
  const dbPool = mkMockDbPool() as any;

  test('PostgresStudentLearningProfileRepository saves and retrieves profile', async () => {
    const repo = new PostgresStudentLearningProfileRepository(dbPool);
    const profile = StudentLearningProfile.create('prof-1', 's-1', 'Accelerated', 18);
    await repo.save(profile);
    const retrieved = await repo.findByStudent('s-1');
    expect(retrieved?.learningPace.value).toBe('Accelerated');
    expect(retrieved?.weeklyStudyHours).toBe(18);
  });

  test('PostgresReadinessRepository saves and retrieves progress', async () => {
    const repo = new PostgresReadinessRepository(dbPool);
    const progress = StudentProgress.create('prog-1', 'j-1', 's-1', 75);
    await repo.saveProgress(progress);
    const retrieved = await repo.findProgressByStudent('s-1');
    expect(retrieved?.readinessScore.value).toBe(75);
    expect(retrieved?.readinessLevel).toBe('NEARLY_READY');
  });

  test('PostgresInterventionRepository saves and retrieves interventions', async () => {
    const repo = new PostgresInterventionRepository(dbPool);
    const intervention = StudentIntervention.create('si-1', 'j-1', 's-1', 'RULE_NO_LOGIN_7D', {
      interventionType: 'INACTIVITY_ALERT',
      title: 'Inactivity',
      description: '7 days',
      triggerReason: 'No login',
      actionRecommended: 'Notify Student',
    });
    await repo.saveIntervention(intervention);
    const retrieved = await repo.findActiveInterventionsByStudent('s-1');
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].ruleCode).toBe('RULE_NO_LOGIN_7D');
  });

  test('PostgresProgrammeEnrollmentRepository handles target exam date and score', async () => {
    const repo = new PostgresProgrammeEnrollmentRepository(dbPool);
    const enrollment = StudentProgrammeEnrollment.create('enr-1', 'j-1', 's-1', 'p-1', 'v-1');
    enrollment.setTargetExamDate(new Date('2026-10-18'));
    enrollment.setTargetScore(7.5);
    await repo.save(enrollment);

    const retrieved = await repo.findById('enr-1');
    expect(retrieved?.targetScore?.value).toBe(7.5);
    expect(retrieved?.examRegistrationStatus).toBe('CONFIRMED');
  });
});
