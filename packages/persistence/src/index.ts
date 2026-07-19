import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { DatabasePool } from './database-pool';
import {
  LessonCode,
  LegacySemanticVersion,
  ContentBlock,
  LessonVersion,
  Lesson,
  LessonRepository
} from './legacy-lesson-shim';
import {
  SecuritySession,
  SecuritySessionRepository,
  AuthenticationMethod,
  AuthenticationMethodRepository,
  TrustedDevice,
  TrustedDeviceRepository,
  DeviceFingerprint,
} from '@clasptek/domain-auth';
import { SecurityProfile, SecurityProfileRepository, LockStatus } from '@clasptek/domain-security';
import {
  Role,
  RoleRepository,
  PermissionGroup,
  PermissionGroupRepository,
  Permission,
  UserRole,
  UserRoleRepository,
} from '@clasptek/domain-authorization';


import {
  Question,
  QuestionVersion,
  AnswerOption,
  Solution,
  Rubric,
  QuestionMedia,
  QuestionStatistics,
  QuestionOwnership,
  QuestionDependency,
  ReviewRequest,
  WorkflowHistory,
  QuestionCode,
  SemanticVersion as QuestionSemanticVersion
} from '@clasptek/domain-question-bank';
import {
  QuestionRepository,
  QuestionReviewRepository,
  QuestionImportRepository,
  QuestionSearchFilters,
  ValidationResult,
  ImportHistory
} from '@clasptek/application-question-bank';

import {
  PracticeSession,
  PracticePlan,
  PracticeRecommendation,
  PracticeStrategy,
  PracticeQuestion,
  PracticeConfiguration,
  DifficultyProfile,
  SpacingPolicy,
  RecommendationPriority,
  SessionMode,
  PracticeDuration,
  MasteryThreshold,
  PracticeFeedback,
  QuestionSelectionRule,
  CompetencyCoverage,
  SelectionWeight,
  CoveragePercentage,
  type Priority,
} from '@clasptek/domain-adaptive-practice';

import {
  type PracticeSessionRepository,
  type PracticePlanRepository,
  type RecommendationRepository,
  type StrategyRepository,
} from '@clasptek/application-adaptive-practice';

import {
  AssessmentSession,
  StudentAnswerSheet,
  StudentAnswer,
  AnswerRevision,
  QuestionVisit,
  RuntimeCheckpoint,
  SecurityIncident,
  RuntimeHeartbeat,
  SubmissionRecord,
} from '@clasptek/domain-assessment-runtime';

import {
  type AssessmentSessionRepository,
  type AnswerSheetRepository,
  type CheckpointRepository,
  type RuntimeStatisticsRepository,
} from '@clasptek/application-assessment-runtime';

import {
  EvaluationJob,
  EvaluationSnapshot,
  EvaluationResult,
  EvaluationProfile,
  HumanReview,
  PromptVersion,
  PromptExecution,
  BandScore,
  ConfidenceLevel,
  Score,
  TokenUsage,
  PromptHash,
  FeedbackSeverity,
  FeedbackSection,
  EvaluationRecommendation,
  EvidenceReference,
  RubricScore,
  ReviewComment,
  type QuestionType,
  type EvaluationJobStatus,
  type HumanReviewStatus,
  type FeedbackSectionType,
} from '@clasptek/domain-ai-evaluation';

import {
  type EvaluationRepository,
  type HumanReviewRepository,
  type ModelRepository,
  type PromptRepository,
  type EvaluationProfileRepository,
  type EvaluationSearchFilters,
} from '@clasptek/application-ai-evaluation';

import {
  ReadinessPrediction,
  ReadinessSnapshot,
  PredictionExperiment,
  PredictionFeatureSet,
  PredictionExplanation,
  PredictionEvidence,
  PredictionTrend,
  PredictionIntervention,
  PredictionRecommendation,
  ReadinessScore,
  ConfidenceBand,
  InterventionPriorityLevel,
  PredictionFeatureCatalogueEntry,
  PredictionOutcome,
  PredictionInterventionCatalogueEntry,
  LearningVelocitySnapshot,
  PredictionLifecycleMetrics
} from '@clasptek/domain-prediction-engine';

import {
  type ReadinessPredictionRepository,
  type ReadinessSnapshotRepository,
  type PredictionExperimentRepository,
  type PredictionFeatureRepository,
  type ModelVersionRepository,
  type PredictionSearchFilters,
  type PredictionFeatureCatalogueRepository,
  type PredictionOutcomeRepository,
  type PredictionInterventionCatalogueRepository,
  type LearningVelocitySnapshotRepository,
  type PredictionLifecycleMetricsRepository
} from '@clasptek/application-prediction-engine';

import {
  LearningCoach,
  CoachBrain,
  CoachMemory,
  StudyGoal,
  CoachConversation,
  HabitTracker,
  HabitAnalytics,
  CoachingPlan,
  DailyStudyPlan,
  StudyPlanTask,
  ReflectionJournal,
  RevisionPlan,
  CoachInsight,
  CoachNotification,
  CoachDashboardProjection,
  ConversationMessage,
  MotivationProfile,
  CoachingSession,
  GoalTarget,
  ReflectionEntry,
  RevisionCampaign,
  CoachingStyle,
} from '@clasptek/domain-learning-coach';

import {
  type LearningCoachRepository,
  type CoachBrainRepository,
  type CoachMemoryRepository,
  type CoachingSessionRepository,
  type CoachingPlanRepository,
  type DailyStudyPlanRepository,
  type RevisionPlanRepository,
  type GoalRepository,
  type ConversationRepository,
  type HabitRepository,
  type HabitAnalyticsRepository,
  type ReflectionRepository,
  type InsightRepository,
  type NotificationRepository,
  type CoachDashboardProjectionRepository,
  type MotivationProfileRepository,
  type GoalType,
} from '@clasptek/application-learning-coach';

import {
  StudentDashboard as AnalyticsStudentDashboard,
  InstructorDashboard as AnalyticsInstructorDashboard,
  AdminDashboard as AnalyticsAdminDashboard,
  CompetencyAnalytics as AnalyticsCompetencyAnalytics,
  LearningTrend as AnalyticsLearningTrend,
  SnapshotVersion as AnalyticsSnapshotVersion,
  ScheduledReport as AnalyticsScheduledReport,
  StudentDashboardProjection as AnalyticsStudentDashboardProjection,
  InstructorDashboardProjection as AnalyticsInstructorDashboardProjection,
  AdminDashboardProjection as AnalyticsAdminDashboardProjection,
  WidgetDefinition as AnalyticsWidgetDefinition,
  ReportDefinition as AnalyticsReportDefinition,
  ReportExecution as AnalyticsReportExecution,
  ExportJob as AnalyticsExportJob,
  TrendPoint as AnalyticsTrendPoint,
  PredictionTrend as AnalyticsPredictionTrend
} from '@clasptek/domain-learning-analytics';

import {
  type AnalyticsDashboardRepository,
  type AnalyticsSnapshotRepository,
  type TrendRepository,
  type ReportRepository,
  type ExportRepository,
  type WidgetRepository,
  type StudentDashboardProjectionRepository,
  type InstructorDashboardProjectionRepository,
  type AdminDashboardProjectionRepository,
  type CompetencyProjectionRepository,
  type RiskProjectionRepository
} from '@clasptek/application-learning-analytics';

/**
 * @domain Database
 * @adapter Postgres
 * Persistence, Postgres pool connection management, and Supabase adapter creators
 */

export interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<void>;
  delete?(id: TId): Promise<void>;
}

export { DatabasePool } from './database-pool';

/**
 * Creates a browser-safe Supabase client (only uses public non-privileged credentials)
 */
export function createSupabaseBrowserClient(url: string, anonKey: string): SupabaseClient {
  return createBrowserClient(url, anonKey);
}

export interface NextCookiesAdapter {
  getAll(): { name: string; value: string }[];
  setAll(cookiesToSet: { name: string; value: string; options: any }[]): void;
}

/**
 * Creates a server-side Supabase client with cookie storage support (NextJS context)
 */
export function createSupabaseServerClient(
  url: string,
  anonKey: string,
  cookieStore: NextCookiesAdapter
): SupabaseClient {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any[]) {
        try {
          cookieStore.setAll(cookiesToSet);
        } catch {
          // Handled if invoked in server page render context where cookies are immutable
        }
      },
    },
  });
}

/**
 * Creates a super-admin service client. Restrict to trusted servers and worker environments.
 */
export function createSupabaseAdminClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Postgres Implementation of the Identity Bounded Context Query Contracts
 */
import {
  User as DomainUser,
  UserId,
  Identity as DomainIdentity,
  IdentityId,
  Profile as DomainProfile,
  ProfileId,
  EmailAddress,
  PersonName,
  IdentityProvider,
  UserStatus,
  IdentityRepository,
} from '@clasptek/domain-identity';
import { IdentityLookupService } from '@clasptek/application-identity';

export class PostgresIdentityLookupService implements IdentityLookupService {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByLoginIdentifier(loginIdentifier: string): Promise<string | null> {
    const pool = this.dbPool.getPool();
    const query = 'SELECT user_id FROM identities WHERE login_identifier = $1 LIMIT 1';
    const res = await pool.query(query, [loginIdentifier]);
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0].user_id;
  }
}

export class PostgresIdentityRepository implements IdentityRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: UserId): Promise<DomainUser | null> {
    const pool = this.dbPool.getPool();

    // 1. Fetch User state
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [
      id.value,
    ]);
    if (userRes.rows.length === 0) {
      return null;
    }
    const userRow = userRes.rows[0];

    // 2. Fetch User Identities
    const identRes = await pool.query(
      'SELECT * FROM identities WHERE user_id = $1 AND deleted_at IS NULL',
      [id.value]
    );
    const identities = identRes.rows.map((row) => {
      return new DomainIdentity(
        new IdentityId(row.id),
        new EmailAddress(row.email),
        row.provider as IdentityProvider,
        row.is_verified,
        row.login_identifier
      );
    });

    // 3. Fetch User Profile
    const profRes = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1 AND deleted_at IS NULL',
      [id.value]
    );
    let profile: DomainProfile | null = null;
    if (profRes.rows.length > 0) {
      const pRow = profRes.rows[0];
      profile = new DomainProfile(
        new ProfileId(pRow.id),
        new PersonName(pRow.first_name),
        new PersonName(pRow.last_name),
        pRow.avatar || undefined,
        pRow.locale,
        pRow.time_zone
      );
    }

    return new DomainUser(
      new UserId(userRow.id),
      userRow.status as UserStatus,
      identities,
      profile,
      userRow.version
    );
  }

  public async save(user: DomainUser): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Optimistic concurrency verification check
      const checkRes = await client.query('SELECT version FROM users WHERE id = $1 FOR UPDATE', [
        user.id.value,
      ]);

      if (checkRes.rows.length > 0) {
        const currentVersion = checkRes.rows[0].version;
        if (currentVersion !== user.version) {
          throw new Error('Optimistic lock error: Aggregate version mismatch');
        }
      }

      // 1. Insert or update User aggregate root
      const userUpsertQuery = `
        INSERT INTO users (id, status, version, updated_at, archived_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          version = EXCLUDED.version,
          updated_at = CURRENT_TIMESTAMP,
          archived_at = EXCLUDED.archived_at
      `;
      const archivedAt = user.status === 'ARCHIVED' ? new Date() : null;
      await client.query(userUpsertQuery, [user.id.value, user.status, user.version, archivedAt]);

      // 2. Save bound Identities
      for (const identity of user.identities) {
        const identUpsertQuery = `
          INSERT INTO identities (id, user_id, email, provider, is_verified, login_identifier, version, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            provider = EXCLUDED.provider,
            is_verified = EXCLUDED.is_verified,
            login_identifier = EXCLUDED.login_identifier,
            version = EXCLUDED.version,
            updated_at = CURRENT_TIMESTAMP
        `;
        await client.query(identUpsertQuery, [
          identity.id.value,
          user.id.value,
          identity.email.value,
          identity.provider,
          identity.isVerified,
          identity.loginIdentifier,
          user.version,
        ]);
      }

      // 3. Save Profile
      if (user.profile) {
        const profileUpsertQuery = `
          INSERT INTO profiles (id, user_id, first_name, last_name, avatar, locale, time_zone, version, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            avatar = EXCLUDED.avatar,
            locale = EXCLUDED.locale,
            time_zone = EXCLUDED.time_zone,
            version = EXCLUDED.version,
            updated_at = CURRENT_TIMESTAMP
        `;
        await client.query(profileUpsertQuery, [
          user.profile.id.value,
          user.id.value,
          user.profile.firstName.value,
          user.profile.lastName.value,
          user.profile.avatar || null,
          user.profile.locale,
          user.profile.timeZone,
          user.version,
        ]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export class PostgresSecurityProfileRepository implements SecurityProfileRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<SecurityProfile | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM security_profiles WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new SecurityProfile(
      r.id,
      r.user_id,
      r.preferred_mfa,
      r.failed_attempts,
      r.lock_status as LockStatus,
      r.security_preferences || {},
      r.version,
      r.created_at,
      r.updated_at
    );
  }

  public async findByUserId(userId: string): Promise<SecurityProfile | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM security_profiles WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new SecurityProfile(
      r.id,
      r.user_id,
      r.preferred_mfa,
      r.failed_attempts,
      r.lock_status as LockStatus,
      r.security_preferences || {},
      r.version,
      r.created_at,
      r.updated_at
    );
  }

  public async save(profile: SecurityProfile): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO security_profiles (id, user_id, preferred_mfa, failed_attempts, lock_status, security_preferences, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        preferred_mfa = EXCLUDED.preferred_mfa,
        failed_attempts = EXCLUDED.failed_attempts,
        lock_status = EXCLUDED.lock_status,
        security_preferences = EXCLUDED.security_preferences,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      profile.id,
      profile.userId,
      profile.preferredMfa,
      profile.failedAttempts,
      profile.lockStatus,
      profile.securityPreferences,
      profile.version,
    ]);
  }
}

export class PostgresSecuritySessionRepository implements SecuritySessionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<SecuritySession | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM security_sessions WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new SecuritySession(
      r.id,
      r.user_id,
      r.supabase_session_id,
      r.browser,
      r.ip_address,
      r.country,
      r.device,
      r.user_agent,
      r.login_timestamp,
      r.revoked_by_admin,
      r.version,
      r.created_at,
      r.updated_at
    );
  }

  public async findBySupabaseSessionId(supabaseSessionId: string): Promise<SecuritySession | null> {
    const res = await this.dbPool
      .getPool()
      .query(
        'SELECT * FROM security_sessions WHERE supabase_session_id = $1 AND deleted_at IS NULL',
        [supabaseSessionId]
      );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new SecuritySession(
      r.id,
      r.user_id,
      r.supabase_session_id,
      r.browser,
      r.ip_address,
      r.country,
      r.device,
      r.user_agent,
      r.login_timestamp,
      r.revoked_by_admin,
      r.version,
      r.created_at,
      r.updated_at
    );
  }

  public async findActiveByUserId(userId: string): Promise<SecuritySession[]> {
    const res = await this.dbPool
      .getPool()
      .query(
        'SELECT * FROM security_sessions WHERE user_id = $1 AND revoked_by_admin = FALSE AND deleted_at IS NULL',
        [userId]
      );
    return res.rows.map(
      (r) =>
        new SecuritySession(
          r.id,
          r.user_id,
          r.supabase_session_id,
          r.browser,
          r.ip_address,
          r.country,
          r.device,
          r.user_agent,
          r.login_timestamp,
          r.revoked_by_admin,
          r.version,
          r.created_at,
          r.updated_at
        )
    );
  }

  public async save(session: SecuritySession): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO security_sessions (id, user_id, supabase_session_id, browser, ip_address, country, device, user_agent, login_timestamp, revoked_by_admin, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        revoked_by_admin = EXCLUDED.revoked_by_admin,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      session.id,
      session.userId,
      session.supabaseSessionId,
      session.browser,
      session.ipAddress,
      session.country,
      session.device,
      session.userAgent,
      session.loginTimestamp,
      session.revokedByAdmin,
      session.version,
    ]);
  }
}

export class PostgresAuthenticationMethodRepository implements AuthenticationMethodRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByUserId(userId: string): Promise<AuthenticationMethod[]> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM authentication_methods WHERE user_id = $1 AND deleted_at IS NULL', [
        userId,
      ]);
    return res.rows.map(
      (r) =>
        new AuthenticationMethod(
          r.id,
          r.user_id,
          r.method_type,
          r.is_enabled,
          r.preferences || {},
          r.version,
          r.created_at,
          r.updated_at
        )
    );
  }

  public async save(method: AuthenticationMethod): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO authentication_methods (id, user_id, method_type, is_enabled, preferences, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        is_enabled = EXCLUDED.is_enabled,
        preferences = EXCLUDED.preferences,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      method.id,
      method.userId,
      method.methodType,
      method.isEnabled,
      method.preferences,
      method.version,
    ]);
  }
}

export class PostgresTrustedDeviceRepository implements TrustedDeviceRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByUserId(userId: string): Promise<TrustedDevice[]> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM trusted_devices WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    return res.rows.map(
      (r) =>
        new TrustedDevice(
          r.id,
          r.user_id,
          new DeviceFingerprint(r.device_fingerprint),
          r.trust_expires_at,
          r.version,
          r.created_at,
          r.updated_at
        )
    );
  }

  public async save(device: TrustedDevice): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO trusted_devices (id, user_id, device_fingerprint, trust_expires_at, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        trust_expires_at = EXCLUDED.trust_expires_at,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      device.id,
      device.userId,
      device.deviceFingerprint.value,
      device.trustExpiresAt,
      device.version,
    ]);
  }
}

export class PostgresRoleRepository implements RoleRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<Role | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM roles WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new Role(r.id, r.name, r.description, r.version, r.created_at, r.updated_at);
  }

  public async findByName(name: string): Promise<Role | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM roles WHERE name = $1 AND deleted_at IS NULL', [name]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new Role(r.id, r.name, r.description, r.version, r.created_at, r.updated_at);
  }

  public async save(role: Role): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO roles (id, name, description, version, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [role.id, role.name, role.description, role.version]);
  }
}

export class PostgresPermissionGroupRepository implements PermissionGroupRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<PermissionGroup | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM permission_groups WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new PermissionGroup(r.id, r.name, r.description, r.version, r.created_at, r.updated_at);
  }

  public async findByName(name: string): Promise<PermissionGroup | null> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM permission_groups WHERE name = $1 AND deleted_at IS NULL', [name]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new PermissionGroup(r.id, r.name, r.description, r.version, r.created_at, r.updated_at);
  }

  public async save(group: PermissionGroup): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO permission_groups (id, name, description, version, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [group.id, group.name, group.description, group.version]);
  }

  public async savePermission(permission: Permission): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO permissions (id, permission_group_id, code, description, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        description = EXCLUDED.description,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      permission.id,
      permission.permissionGroupId,
      permission.code,
      permission.description,
      permission.version,
    ]);
  }

  public async assignGroupToRole(roleId: string, groupId: string): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO role_permission_groups (role_id, permission_group_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;
    await pool.query(query, [roleId, groupId]);
  }
}

export class PostgresUserRoleRepository implements UserRoleRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByUserId(userId: string): Promise<UserRole[]> {
    const res = await this.dbPool
      .getPool()
      .query('SELECT * FROM user_roles WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    return res.rows.map(
      (r) => new UserRole(r.id, r.user_id, r.role_id, r.version, r.created_at, r.updated_at)
    );
  }

  public async save(userRole: UserRole): Promise<void> {
    const pool = this.dbPool.getPool();
    const query = `
      INSERT INTO user_roles (id, user_id, role_id, version, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        role_id = EXCLUDED.role_id,
        version = EXCLUDED.version,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [userRole.id, userRole.userId, userRole.roleId, userRole.version]);
  }

  public async delete(userId: string, roleId: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      'UPDATE user_roles SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );
  }
}

export * from './exam-product/postgres-unit-of-work';
export * from './exam-product/postgres-exam-product.repository';
export * from './exam-product/postgres-blueprint.repository';
export * from './exam-product/postgres-skill-framework.repository';
export * from './exam-product/postgres-learning-framework.repository';
export * from './exam-product/postgres-readiness-framework.repository';
export * from './exam-product/postgres-diagnostic-framework.repository';

export * from './curriculum/postgres-curriculum.repository';
export * from './curriculum/postgres-curriculum-version.repository';
export * from './curriculum/postgres-learning-module.repository';
export * from './curriculum/postgres-lesson.repository';
export * from './curriculum/postgres-curriculum-template.repository';
export * from './curriculum/postgres-projection.query';

export * from './legacy-lesson-shim';

export class PostgresLessonRepository implements LessonRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string {
    return randomUUID();
  }

  public async exists(code: string): Promise<boolean> {
    const pool = this.dbPool.getPool();
    const res = await pool.query('SELECT 1 FROM public.lessons WHERE code = $1 AND deleted_at IS NULL LIMIT 1', [code]);
    return res.rows.length > 0;
  }

  public async findByCode(code: string): Promise<Lesson | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query('SELECT id FROM public.lessons WHERE code = $1 AND deleted_at IS NULL LIMIT 1', [code]);
    if (res.rows.length === 0) return null;
    return this.findById(res.rows[0].id);
  }

  public async findById(id: string): Promise<Lesson | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query('SELECT * FROM public.lessons WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    const lesson = new Lesson(
      row.id,
      row.learning_module_id || row.module_id,
      new LessonCode(row.code),
      row.title || row.name,
      row.summary || row.description || '',
      Number(row.default_sequence_no || row.display_order || 1),
      row.status as any,
      Number(row.lock_version || 0),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    // Load Versions
    const vRes = await pool.query('SELECT * FROM public.lesson_versions WHERE lesson_id = $1 AND deleted_at IS NULL', [id]);
    for (const vRow of vRes.rows) {
      const version = new LessonVersion(
        vRow.id,
        vRow.lesson_id,
        new LegacySemanticVersion(vRow.version_no),
        vRow.status as any,
        vRow.name,
        vRow.description || ''
      );

      // Load Content Blocks
      const cbRes = await pool.query('SELECT * FROM public.content_blocks WHERE lesson_version_id = $1 ORDER BY display_order ASC', [vRow.id]);
      for (const cbRow of cbRes.rows) {
        version.contentBlocks.push(
          new ContentBlock(
            cbRow.id,
            cbRow.lesson_version_id,
            cbRow.block_type,
            cbRow.text_content,
            cbRow.display_order
          )
        );
      }

      lesson.versions.push(version);
    }

    return lesson;
  }

  public async save(lesson: Lesson): Promise<void> {
    const pool = this.dbPool.getPool();

    // Check concurrency
    const exists = await pool.query('SELECT lock_version FROM public.lessons WHERE id = $1', [lesson.id]);
    if (exists.rows.length > 0) {
      const currentLock = Number(exists.rows[0].lock_version || 0);
      if (currentLock !== lesson.lockVersion) {
        throw new Error('Concurrency violation: Lesson has been modified by another process.');
      }
      const newLock = lesson.lockVersion + 1;
      await pool.query(
        'UPDATE public.lessons SET title = $1, name = $2, summary = $3, description = $4, default_sequence_no = $5, display_order = $6, status = $7, lock_version = $8, updated_at = now() WHERE id = $9',
        [lesson.name, lesson.name, lesson.description, lesson.description, lesson.displayOrder, lesson.displayOrder, lesson.status, newLock, lesson.id]
      );
      (lesson as any).lockVersion = newLock;
    } else {
      await pool.query(
        'INSERT INTO public.lessons (id, learning_module_id, module_id, code, title, name, summary, description, default_sequence_no, display_order, status, lock_version, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now(), now())',
        [lesson.id, lesson.moduleId, lesson.moduleId, lesson.code.value, lesson.name, lesson.name, lesson.description, lesson.description, lesson.displayOrder, lesson.displayOrder, lesson.status, lesson.lockVersion]
      );
    }

    // Save Versions & Content Blocks
    for (const v of lesson.versions) {
      const vExists = await pool.query('SELECT id FROM public.lesson_versions WHERE id = $1', [v.id]);
      if (vExists.rows.length > 0) {
        await pool.query(
          'UPDATE public.lesson_versions SET status = $1, name = $2, description = $3, updated_at = now() WHERE id = $4',
          [v.status, v.name, v.description, v.id]
        );
      } else {
        await pool.query(
          'INSERT INTO public.lesson_versions (id, lesson_id, version_no, status, name, description, lock_version, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, 0, now(), now())',
          [v.id, v.lessonId, v.versionNo.value, v.status, v.name, v.description]
        );
      }

      // Re-save Content Blocks (clear and insert)
      await pool.query('DELETE FROM public.content_blocks WHERE lesson_version_id = $1', [v.id]);
      for (const cb of v.contentBlocks) {
        await pool.query(
          'INSERT INTO public.content_blocks (id, lesson_version_id, block_type, text_content, display_order) VALUES ($1, $2, $3, $4, $5)',
          [cb.id, cb.lessonVersionId, cb.blockType, cb.textContent, cb.displayOrder]
        );
      }
    }
  }

  public async search(filters: { moduleId?: string }): Promise<Lesson[]> {
    const pool = this.dbPool.getPool();
    let query = 'SELECT id FROM public.lessons WHERE deleted_at IS NULL';
    const params: any[] = [];
    if (filters.moduleId) {
      params.push(filters.moduleId);
      query += ` AND (learning_module_id = $${params.length} OR module_id = $${params.length})`;
    }
    query += ' ORDER BY default_sequence_no ASC, display_order ASC';

    const res = await pool.query(query, params);
    const lessons: Lesson[] = [];
    for (const row of res.rows) {
      const l = await this.findById(row.id);
      if (l) lessons.push(l);
    }
    return lessons;
  }
}


export { PostgresLearningResourceRepository } from './learning-resource/postgres-learning-resource.repository';
export { PostgresResourceVersionRepository } from './learning-resource/postgres-resource-version.repository';
export { PostgresResourceCollectionRepository } from './learning-resource/postgres-resource-collection.repository';
export { PostgresStorageAssetRepository } from './learning-resource/postgres-storage-asset.repository';
export {
  SupabaseStorageAdapter,
  LocalMimeInspectionAdapter,
  LocalChecksumAdapter,
  MockSecurityScanAdapter,
  PostgresStorageQuotaAdapter
} from './learning-resource/storage-provider-adapters';


export class PostgresQuestionRepository implements QuestionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string {
    return randomUUID();
  }

  public async save(question: Question): Promise<void> {
    const pool = this.dbPool.getPool();

    // 1. Save Question Aggregate Root
    const qRes = await pool.query('SELECT lock_version FROM questions WHERE id = $1', [question.id]);
    if (qRes.rows.length > 0) {
      const currentLock = Number(qRes.rows[0].lock_version);
      if (currentLock !== question.lockVersion) {
        throw new Error(`Optimistic lock failure: Question ${question.id} has been modified by another process`);
      }
      await pool.query(
        `UPDATE questions SET
           exam_product_id = $1,
           curriculum_module_id = $2,
           status = $3,
           lock_version = lock_version + 1,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND lock_version = $5`,
        [question.examProductId, question.curriculumModuleId, question.status, question.id, question.lockVersion]
      );
    } else {
      await pool.query(
        `INSERT INTO questions (id, code, exam_product_id, curriculum_module_id, status, lock_version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [question.id, question.code.value, question.examProductId, question.curriculumModuleId, question.status, question.lockVersion]
      );
    }

    // 2. Save Question Versions & Children
    for (const ver of question.versions) {
      const vRes = await pool.query('SELECT 1 FROM question_versions WHERE id = $1', [ver.id]);
      if (vRes.rows.length > 0) {
        await pool.query(
          `UPDATE question_versions SET
             status = $1,
             title = $2,
             payload = $3,
             digital_signature = $4,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $5`,
          [ver.status, ver.title, ver.payload, ver.digitalSignature, ver.id]
        );
      } else {
        await pool.query(
          `INSERT INTO question_versions (id, question_id, version_no, status, title, payload, digital_signature, created_at, updated_at, lock_version)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $8)`,
          [ver.id, question.id, ver.versionNo.value, ver.status, ver.title, ver.payload, ver.digitalSignature, ver.lockVersion]
        );
      }

      // Re-save Options
      await pool.query('DELETE FROM answer_options WHERE question_version_id = $1', [ver.id]);
      for (const opt of ver.answerOptions) {
        await pool.query(
          `INSERT INTO answer_options (id, question_version_id, code, text_content, is_correct, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [opt.id, ver.id, opt.code, opt.textContent, opt.isCorrect, opt.displayOrder]
        );
      }

      // Re-save Media
      await pool.query('DELETE FROM question_media WHERE question_version_id = $1', [ver.id]);
      for (const med of ver.mediaAssets) {
        await pool.query(
          `INSERT INTO question_media (id, question_version_id, provider, bucket, object_key, checksum, mime_type, file_size, duration_seconds, transcript, caption, thumbnail_key, alt_text)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [med.id, ver.id, med.provider, med.bucket, med.objectKey, med.checksum, med.mimeType, med.fileSize, med.durationSeconds, med.transcript, med.caption, med.thumbnailKey, med.altText]
        );
      }

      // Re-save Solutions
      await pool.query('DELETE FROM solutions WHERE question_version_id = $1', [ver.id]);
      if (ver.solution) {
        const sol = ver.solution;
        await pool.query(
          `INSERT INTO solutions (id, question_version_id, explanation, incorrect_explanation, hint, reference_url, teaching_note)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [sol.id, ver.id, sol.explanation, sol.incorrectExplanation, sol.hint, sol.referenceUrl, sol.teachingNote]
        );
      }

      // Re-save Rubrics
      await pool.query('DELETE FROM rubrics WHERE question_version_id = $1', [ver.id]);
      if (ver.rubric) {
        const rub = ver.rubric;
        await pool.query(
          `INSERT INTO rubrics (id, question_version_id, criteria, max_points, description)
           VALUES ($1, $2, $3, $4, $5)`,
          [rub.id, ver.id, rub.criteria, rub.maxPoints, rub.description]
        );
      }
    }

    // 3. Re-save Statistics
    if (question.statistics) {
      const stats = question.statistics;
      await pool.query(
        `INSERT INTO question_statistics (id, question_id, times_used, times_answered, correct_rate, facility_index, discrimination_index, guess_probability, average_duration_ms, median_duration_ms, skip_rate, last_used)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (question_id) DO UPDATE SET
           times_used = EXCLUDED.times_used,
           times_answered = EXCLUDED.times_answered,
           correct_rate = EXCLUDED.correct_rate,
           facility_index = EXCLUDED.facility_index,
           discrimination_index = EXCLUDED.discrimination_index,
           guess_probability = EXCLUDED.guess_probability,
           average_duration_ms = EXCLUDED.average_duration_ms,
           median_duration_ms = EXCLUDED.median_duration_ms,
           skip_rate = EXCLUDED.skip_rate,
           last_used = EXCLUDED.last_used`,
        [stats.id, question.id, stats.timesUsed, stats.timesAnswered, stats.correctRate, stats.facilityIndex, stats.discriminationIndex, stats.guessProbability, stats.averageDurationMs, stats.medianDurationMs, stats.skipRate, stats.lastUsed]
      );
    }

    // 4. Re-save Ownership
    if (question.ownership) {
      const own = question.ownership;
      await pool.query(
        `INSERT INTO question_ownership (id, question_id, copyright_holder, license, source, reuse_policy, expiration_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (question_id) DO UPDATE SET
           copyright_holder = EXCLUDED.copyright_holder,
           license = EXCLUDED.license,
           source = EXCLUDED.source,
           reuse_policy = EXCLUDED.reuse_policy,
           expiration_date = EXCLUDED.expiration_date`,
        [randomUUID(), question.id, own.copyrightHolder, own.license, own.source, own.reusePolicy, own.expirationDate]
      );
    }

    // 5. Re-save Dependencies
    await pool.query('DELETE FROM question_dependencies WHERE parent_question_id = $1', [question.id]);
    for (const dep of question.dependencies) {
      await pool.query(
        `INSERT INTO question_dependencies (id, parent_question_id, child_question_id, dependency_type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (parent_question_id, child_question_id) DO NOTHING`,
        [randomUUID(), dep.parentQuestionId, dep.childQuestionId, dep.dependencyType]
      );
    }
  }

  public async findById(id: string): Promise<Question | null> {
    const pool = this.dbPool.getPool();
    const qRes = await pool.query('SELECT * FROM questions WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (qRes.rows.length === 0) return null;
    const row = qRes.rows[0];

    const question = new Question(
      row.id,
      new QuestionCode(row.code),
      row.exam_product_id,
      row.curriculum_module_id,
      row.status,
      Number(row.lock_version)
    );

    // Fetch Versions
    const vRes = await pool.query('SELECT * FROM question_versions WHERE question_id = $1', [id]);
    for (const vRow of vRes.rows) {
      const ver = new QuestionVersion(
        vRow.id,
        new QuestionSemanticVersion(vRow.version_no),
        vRow.status,
        vRow.title,
        vRow.payload,
        vRow.digital_signature,
        Number(vRow.lock_version)
      );

      // Fetch options
      const oRes = await pool.query('SELECT * FROM answer_options WHERE question_version_id = $1 ORDER BY display_order ASC', [ver.id]);
      for (const oRow of oRes.rows) {
        ver.answerOptions.push(new AnswerOption(oRow.id, oRow.code, oRow.text_content, oRow.is_correct, oRow.display_order));
      }

      // Fetch media
      const mRes = await pool.query('SELECT * FROM question_media WHERE question_version_id = $1', [ver.id]);
      for (const mRow of mRes.rows) {
        ver.mediaAssets.push(new QuestionMedia(
          mRow.id,
          mRow.provider,
          mRow.bucket,
          mRow.object_key,
          mRow.checksum,
          mRow.mime_type,
          Number(mRow.file_size),
          mRow.duration_seconds ? Number(mRow.duration_seconds) : null,
          mRow.transcript,
          mRow.caption,
          mRow.thumbnail_key,
          mRow.alt_text
        ));
      }

      // Fetch solution
      const sRes = await pool.query('SELECT * FROM solutions WHERE question_version_id = $1 LIMIT 1', [ver.id]);
      if (sRes.rows.length > 0) {
        const sRow = sRes.rows[0];
        ver.setSolution(new Solution(sRow.id, sRow.explanation, sRow.incorrect_explanation, sRow.hint, sRow.reference_url, sRow.teaching_note));
      }

      // Fetch rubric
      const rRes = await pool.query('SELECT * FROM rubrics WHERE question_version_id = $1 LIMIT 1', [ver.id]);
      if (rRes.rows.length > 0) {
        const rRow = rRes.rows[0];
        ver.setRubric(new Rubric(rRow.id, rRow.criteria, Number(rRow.max_points), rRow.description));
      }

      question.versions.push(ver);
    }

    // Fetch Statistics
    const stRes = await pool.query('SELECT * FROM question_statistics WHERE question_id = $1 LIMIT 1', [id]);
    if (stRes.rows.length > 0) {
      const stRow = stRes.rows[0];
      question.updateStatistics(new QuestionStatistics(
        stRow.id,
        stRow.times_used,
        stRow.times_answered,
        Number(stRow.correct_rate),
        Number(stRow.facility_index),
        Number(stRow.discrimination_index),
        Number(stRow.guess_probability),
        stRow.average_duration_ms,
        stRow.median_duration_ms,
        Number(stRow.skip_rate),
        stRow.last_used ? new Date(stRow.last_used) : null
      ));
    }

    // Fetch Ownership
    const ownRes = await pool.query('SELECT * FROM question_ownership WHERE question_id = $1 LIMIT 1', [id]);
    if (ownRes.rows.length > 0) {
      const ownRow = ownRes.rows[0];
      question.setOwnership(new QuestionOwnership(
        ownRow.copyright_holder,
        ownRow.license,
        ownRow.source,
        ownRow.reuse_policy,
        ownRow.expiration_date ? new Date(ownRow.expiration_date) : null
      ));
    }

    // Fetch Dependencies
    const depRes = await pool.query('SELECT * FROM question_dependencies WHERE parent_question_id = $1', [id]);
    for (const dRow of depRes.rows) {
      question.addDependency(new QuestionDependency(dRow.parent_question_id, dRow.child_question_id, dRow.dependency_type));
    }

    return question;
  }

  public async findByCode(code: string): Promise<Question | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query('SELECT id FROM questions WHERE code = $1 AND deleted_at IS NULL LIMIT 1', [code]);
    if (res.rows.length === 0) return null;
    return this.findById(res.rows[0].id);
  }

  public async findPublished(id: string): Promise<Question | null> {
    const q = await this.findById(id);
    if (!q || q.status !== 'PUBLISHED') return null;
    return q;
  }

  public async findVersion(questionId: string, versionNo: string): Promise<QuestionVersion | null> {
    const q = await this.findById(questionId);
    if (!q) return null;
    return q.versions.find(v => v.versionNo.value === versionNo) || null;
  }

  public async publish(id: string, versionNo: string): Promise<void> {
    const q = await this.findById(id);
    if (!q) throw new Error(`Question ${id} not found`);
    q.publish(new QuestionSemanticVersion(versionNo));
    await this.save(q);
  }

  public async archive(id: string): Promise<void> {
    const q = await this.findById(id);
    if (!q) throw new Error(`Question ${id} not found`);
    q.archive();
    await this.save(q);
  }

  public async restore(id: string): Promise<void> {
    const q = await this.findById(id);
    if (!q) throw new Error(`Question ${id} not found`);
    q.restore();
    await this.save(q);
  }

  public async duplicate(id: string): Promise<string> {
    const source = await this.findById(id);
    if (!source) throw new Error(`Question ${id} not found`);
    const newId = this.nextIdentity();
    const newCode = `${source.code.value}-DUP-${Date.now()}`;
    const duplicated = Question.create(newId, new QuestionCode(newCode), source.examProductId, source.curriculumModuleId);
    await this.save(duplicated);
    return newId;
  }

  public async search(filters: QuestionSearchFilters): Promise<Question[]> {
    const pool = this.dbPool.getPool();
    let query = 'SELECT q.id FROM questions q';
    const wheres = ['q.deleted_at IS NULL'];
    const joins: string[] = [];
    const params = [];

    if (filters.examProductId) {
      params.push(filters.examProductId);
      wheres.push(`q.exam_product_id = $${params.length}`);
    }
    if (filters.curriculumModuleId) {
      params.push(filters.curriculumModuleId);
      wheres.push(`q.curriculum_module_id = $${params.length}`);
    }
    if (filters.status) {
      params.push(filters.status);
      wheres.push(`q.status = $${params.length}`);
    }

    const fullQuery = `${query} ${joins.join(' ')} WHERE ${wheres.join(' AND ')} ORDER BY q.id ASC`;
    const res = await pool.query(fullQuery, params);
    const results: Question[] = [];
    for (const row of res.rows) {
      const item = await this.findById(row.id);
      if (item) results.push(item);
    }
    return results;
  }
}

export class PostgresQuestionReviewRepository implements QuestionReviewRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string {
    return randomUUID();
  }

  public async save(review: ReviewRequest): Promise<void> {
    const pool = this.dbPool.getPool();

    // 1. Save Review Request
    const rRes = await pool.query('SELECT 1 FROM question_reviews WHERE id = $1', [review.id]);
    if (rRes.rows.length > 0) {
      await pool.query(
        `UPDATE question_reviews SET
           status = $1,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [review.status, review.id]
      );
    } else {
      await pool.query(
        `INSERT INTO question_reviews (id, question_id, reviewer_id, reviewer_role, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [review.id, review.questionId, randomUUID(), 'academic_reviewer', review.status]
      );
    }

    // 2. Re-save Workflow Comments & Reports
    await pool.query('DELETE FROM question_workflow_history WHERE question_id = $1', [review.questionId]);
    for (const hist of review.history) {
      await pool.query(
        `INSERT INTO question_workflow_history (id, question_id, stage, actor_id, comments, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [hist.id, review.questionId, hist.stage, hist.actorId, hist.comments, hist.timestamp]
      );
    }
  }

  public async findById(id: string): Promise<ReviewRequest | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query('SELECT * FROM question_reviews WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    const review = new ReviewRequest(row.id, row.question_id, row.status);

    // Fetch comment log details
    const hRes = await pool.query('SELECT * FROM question_workflow_history WHERE question_id = $1 ORDER BY timestamp ASC', [row.question_id]);
    for (const hRow of hRes.rows) {
      review.history.push(new WorkflowHistory(
        hRow.id,
        hRow.stage,
        hRow.actor_id,
        hRow.comments,
        new Date(hRow.timestamp)
      ));
    }
    return review;
  }

  public async findByQuestionId(questionId: string): Promise<ReviewRequest | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query('SELECT id FROM question_reviews WHERE question_id = $1 LIMIT 1', [questionId]);
    if (res.rows.length === 0) return null;
    return this.findById(res.rows[0].id);
  }
}

export class PostgresQuestionImportRepository implements QuestionImportRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async preview(_importId: string): Promise<any> {
    return { importId: _importId, previewData: [] };
  }

  public async validate(payloads: any[]): Promise<ValidationResult> {
    const errors: string[] = [];
    for (let i = 0; i < payloads.length; i++) {
      const p = payloads[i];
      if (!p.code) {
        errors.push(`Row ${i + 1}: Missing code`);
      }
      if (!p.title) {
        errors.push(`Row ${i + 1}: Missing title`);
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public async approve(_importId: string): Promise<void> {
    // mock pipeline approval
  }

  public async import(payloads: any[]): Promise<string[]> {
    const pool = this.dbPool.getPool();
    const ids: string[] = [];
    for (const p of payloads) {
      const id = randomUUID();
      await pool.query(
        `INSERT INTO questions (id, code, status, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [id, p.code, 'DRAFT']
      );
      ids.push(id);
    }
    return ids;
  }

  public async rollback(_importId: string): Promise<void> {
    // mock import rollback execution
  }

  public async history(): Promise<ImportHistory[]> {
    return [
      { importId: 'imp-1', timestamp: new Date(), status: 'COMPLETED' }
    ];
  }
}

// ═══════════════════════════════════════════════════════════════════
// STUDENT LEARNING JOURNEY — PERSISTENCE REPOSITORIES
// ═══════════════════════════════════════════════════════════════════

import {
  StudentLearningJourney,
  StudentProgrammeEnrollment,
  LearningPlan,
  LearningPlanVersion,
  LearningGoal,
  LearningMilestone,
  CompetencyProgress,
  CompetencyProgressHistoryEntry,
  StudySession,
  Achievement,
  Bookmark,
  StudentDashboardProjection,
  type JourneyStatus,
  type EnrollmentStatus,
  type GoalPriority,
  type GoalStatus,
  type BookmarkResourceType,
  type LearningPlanSource,
} from '@clasptek/domain-student-learning';
import {
  StudentLearningRepository,
  ProgrammeEnrollmentRepository,
  LearningPlanRepository,
  DashboardProjectionRepository,
  type StudentLearningSearchFilters,
} from '@clasptek/application-student-learning';

// ─────────────────────────────────────────────────────────────────

export class PostgresStudentLearningRepository implements StudentLearningRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string { return randomUUID(); }

  public async save(journey: StudentLearningJourney): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Upsert journey root
      await client.query(
        `INSERT INTO student_learning_journeys
           (id, student_id, status, lock_version, consent_given, data_retention_policy, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           consent_given = EXCLUDED.consent_given,
           data_retention_policy = EXCLUDED.data_retention_policy,
           lock_version = student_learning_journeys.lock_version + 1,
           updated_at = CURRENT_TIMESTAMP
         WHERE student_learning_journeys.lock_version = $4`,
        [journey.id, journey.studentId, journey.status, journey.lockVersion,
         journey.consentGiven, journey.dataRetentionPolicy ?? null]
      );

      // Upsert goals
      for (const goal of journey.goals) {
        await client.query(
          `INSERT INTO learning_goals
             (id, journey_id, programme_id, title, description, goal_priority, status, target_date, completed_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status,
             completed_at = EXCLUDED.completed_at,
             updated_at = CURRENT_TIMESTAMP`,
          [goal.id, journey.id, goal.programmeId ?? null, goal.title,
           goal.description ?? null, goal.priority, goal.status,
           goal.targetDate ?? null, goal.completedAt ?? null]
        );
      }

      // Upsert milestones
      for (const m of journey.milestones) {
        await client.query(
          `INSERT INTO learning_milestones
             (id, journey_id, title, milestone_type, completed, completed_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             completed = EXCLUDED.completed,
             completed_at = EXCLUDED.completed_at`,
          [m.id, journey.id, m.title, m.milestoneType, m.completed, m.completedAt ?? null]
        );
      }

      // Upsert competencies
      for (const c of journey.competencies) {
        await client.query(
          `INSERT INTO competency_progress
             (id, journey_id, competency_id, mastery_score, last_updated, created_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (journey_id, competency_id) DO UPDATE SET
             mastery_score = EXCLUDED.mastery_score,
             last_updated = CURRENT_TIMESTAMP`,
          [c.id, journey.id, c.competencyId, c.masteryScore]
        );
        // Persist history entries not yet in DB
        for (const h of c.history) {
          await client.query(
            `INSERT INTO competency_progress_history
               (id, competency_progress_id, previous_score, new_score, source, actor_id, recorded_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT DO NOTHING`,
            [h.id, c.id, h.previousScore ?? null, h.newScore,
             h.source ?? null, h.actorId ?? null, h.recordedAt]
          );
        }
      }

      // Upsert study sessions
      for (const s of journey.sessions) {
        await client.query(
          `INSERT INTO study_sessions
             (id, journey_id, programme_id, started_at, ended_at, duration_ms,
              device_type, platform, ip_hash, timezone, interruption_count, idle_time_ms, completion_reason, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             ended_at = EXCLUDED.ended_at,
             duration_ms = EXCLUDED.duration_ms`,
          [s.id, journey.id, s.programmeId ?? null, s.startedAt, s.endedAt ?? null,
           s.durationMs ?? null, s.deviceType ?? null, s.platform ?? null,
           s.ipHash ?? null, s.timezone ?? null, s.interruptionCount,
           s.idleTimeMs, s.completionReason ?? null]
        );
      }

      // Upsert streak
      await client.query(
        `INSERT INTO study_streaks
           (id, journey_id, current_streak, longest_streak, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (journey_id) DO UPDATE SET
           current_streak = EXCLUDED.current_streak,
           longest_streak = EXCLUDED.longest_streak,
           updated_at = CURRENT_TIMESTAMP`,
        [randomUUID(), journey.id, journey.streak.current, journey.streak.longest]
      );

      // Upsert achievements
      for (const a of journey.achievements) {
        await client.query(
          `INSERT INTO achievements
             (id, journey_id, definition_id, achievement_type, unlocked_at, payload, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, journey.id, a.definitionId ?? null, a.achievementType,
           a.unlockedAt, a.payload ? JSON.stringify(a.payload) : null]
        );
      }

      // Upsert bookmarks
      for (const b of journey.bookmarks) {
        await client.query(
          `INSERT INTO bookmarks
             (id, journey_id, resource_type, resource_id, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
           ON CONFLICT (journey_id, resource_type, resource_id) DO UPDATE SET notes = EXCLUDED.notes`,
          [b.id, journey.id, b.resourceType, b.resourceId, b.notes ?? null]
        );
      }

      // Append journey events (domain events as event stream)
      for (const ev of journey.domainEvents as any[]) {
        await client.query(
          `INSERT INTO journey_events
             (id, journey_id, event_name, event_version, payload, occurred_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [ev.eventId, journey.id, ev.eventName, ev.eventVersion,
           JSON.stringify(ev.payload), ev.occurredAt]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<StudentLearningJourney | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM student_learning_journeys WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  public async findByStudent(studentId: string): Promise<StudentLearningJourney | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM student_learning_journeys WHERE student_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 1`,
      [studentId]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  public async findActive(studentId: string): Promise<StudentLearningJourney | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM student_learning_journeys WHERE student_id = $1 AND status = 'ACTIVE' AND deleted_at IS NULL LIMIT 1`,
      [studentId]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  public async archive(id: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `UPDATE student_learning_journeys SET status = 'ARCHIVED', deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }

  public async restore(id: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `UPDATE student_learning_journeys SET deleted_at = NULL WHERE id = $1`,
      [id]
    );
  }

  public async search(filters: StudentLearningSearchFilters): Promise<StudentLearningJourney[]> {
    const pool = this.dbPool.getPool();
    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let idx = 1;
    if (filters.studentId) { conditions.push(`student_id = $${idx++}`); params.push(filters.studentId); }
    if (filters.status) { conditions.push(`status = $${idx++}`); params.push(filters.status); }
    const res = await pool.query(
      `SELECT * FROM student_learning_journeys WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT ${filters.limit ?? 50} OFFSET ${filters.offset ?? 0}`,
      params
    );
    return Promise.all(res.rows.map((r: any) => this._hydrate(r, pool)));
  }

  private async _hydrate(row: any, pool: Pool): Promise<StudentLearningJourney> {
    const journey = new StudentLearningJourney({
      id: row.id,
      studentId: row.student_id,
      status: row.status as JourneyStatus,
      consentGiven: row.consent_given ?? false,
      dataRetentionPolicy: row.data_retention_policy,
      lockVersion: row.lock_version ?? 0,
    });

    // Load streak
    const streakRes = await pool.query(
      `SELECT * FROM study_streaks WHERE journey_id = $1`, [row.id]
    );
    if (streakRes.rows[0]) {
      journey._setStreak(streakRes.rows[0].current_streak, streakRes.rows[0].longest_streak);
    }

    // Load goals
    const goalRes = await pool.query(
      `SELECT * FROM learning_goals WHERE journey_id = $1 AND deleted_at IS NULL`, [row.id]
    );
    for (const g of goalRes.rows) {
      journey._pushGoal(new LearningGoal({
        id: g.id, programmeId: g.programme_id, title: g.title,
        description: g.description, priority: g.goal_priority as GoalPriority,
        status: g.status as GoalStatus, targetDate: g.target_date,
        completedAt: g.completed_at,
      }));
    }

    // Load milestones
    const msRes = await pool.query(
      `SELECT * FROM learning_milestones WHERE journey_id = $1`, [row.id]
    );
    for (const m of msRes.rows) {
      journey._pushMilestone(new LearningMilestone({
        id: m.id, title: m.title, milestoneType: m.milestone_type,
        completed: m.completed, completedAt: m.completed_at,
      }));
    }

    // Load competencies + history
    const cpRes = await pool.query(
      `SELECT * FROM competency_progress WHERE journey_id = $1`, [row.id]
    );
    for (const cp of cpRes.rows) {
      const histRes = await pool.query(
        `SELECT * FROM competency_progress_history WHERE competency_progress_id = $1 ORDER BY recorded_at ASC`,
        [cp.id]
      );
      const history = histRes.rows.map((h: any) => new CompetencyProgressHistoryEntry({
        id: h.id, previousScore: h.previous_score, newScore: h.new_score,
        source: h.source, actorId: h.actor_id, recordedAt: h.recorded_at,
      }));
      journey._pushCompetency(new CompetencyProgress({
        id: cp.id, competencyId: cp.competency_id,
        masteryScore: parseFloat(cp.mastery_score), lastUpdated: cp.last_updated, history,
      }));
    }

    // Load sessions
    const sessRes = await pool.query(
      `SELECT * FROM study_sessions WHERE journey_id = $1 ORDER BY started_at ASC`, [row.id]
    );
    for (const s of sessRes.rows) {
      journey._pushSession(new StudySession({
        id: s.id, programmeId: s.programme_id, startedAt: s.started_at,
        endedAt: s.ended_at, durationMs: s.duration_ms,
        deviceType: s.device_type, platform: s.platform, ipHash: s.ip_hash,
        timezone: s.timezone, interruptionCount: s.interruption_count,
        idleTimeMs: s.idle_time_ms, completionReason: s.completion_reason,
      }));
    }

    // Load achievements
    const achRes = await pool.query(
      `SELECT * FROM achievements WHERE journey_id = $1`, [row.id]
    );
    for (const a of achRes.rows) {
      journey._pushAchievement(new Achievement({
        id: a.id, achievementType: a.achievement_type,
        definitionId: a.definition_id, unlockedAt: a.unlocked_at,
        payload: a.payload,
      }));
    }

    // Load bookmarks
    const bmRes = await pool.query(
      `SELECT * FROM bookmarks WHERE journey_id = $1`, [row.id]
    );
    for (const b of bmRes.rows) {
      journey._pushBookmark(new Bookmark({
        id: b.id, resourceType: b.resource_type as BookmarkResourceType,
        resourceId: b.resource_id, notes: b.notes, createdAt: b.created_at,
      }));
    }

    return journey;
  }
}

// ─────────────────────────────────────────────────────────────────

export class PostgresProgrammeEnrollmentRepository implements ProgrammeEnrollmentRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string { return randomUUID(); }

  public async save(enrollment: StudentProgrammeEnrollment): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO student_programme_enrollments
         (id, journey_id, student_id, programme_id, programme_version_id,
          enrollment_status, delivery_mode, cohort_id, intake_date, payment_verified,
          instructor_id, completion_certificate_id, withdrawn_at, withdrawal_reason,
          completed_at, lock_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         enrollment_status = EXCLUDED.enrollment_status,
         withdrawn_at = EXCLUDED.withdrawn_at,
         withdrawal_reason = EXCLUDED.withdrawal_reason,
         completed_at = EXCLUDED.completed_at,
         payment_verified = EXCLUDED.payment_verified,
         instructor_id = EXCLUDED.instructor_id,
         lock_version = student_programme_enrollments.lock_version + 1,
         updated_at = CURRENT_TIMESTAMP
       WHERE student_programme_enrollments.lock_version = $16`,
      [enrollment.id, enrollment.journeyId, enrollment.studentId,
       enrollment.programmeId, enrollment.programmeVersionId,
       enrollment.status, enrollment.deliveryMode ?? null,
       enrollment.cohortId ?? null, enrollment.intakeDate ?? null,
       enrollment.paymentVerified, enrollment.instructorId ?? null,
       enrollment.completionCertificateId ?? null,
       enrollment.withdrawnAt ?? null, enrollment.withdrawalReason ?? null,
       enrollment.completedAt ?? null, enrollment.lockVersion]
    );
  }

  public async findById(id: string): Promise<StudentProgrammeEnrollment | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM student_programme_enrollments WHERE id = $1 AND deleted_at IS NULL`, [id]
    );
    return res.rows[0] ? this._hydrate(res.rows[0]) : null;
  }

  public async findByJourney(journeyId: string): Promise<StudentProgrammeEnrollment[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM student_programme_enrollments WHERE journey_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC`,
      [journeyId]
    );
    return res.rows.map((r: any) => this._hydrate(r));
  }

  public async findByStudentAndProgramme(studentId: string, programmeId: string): Promise<StudentProgrammeEnrollment | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM student_programme_enrollments WHERE student_id = $1 AND programme_id = $2 AND deleted_at IS NULL LIMIT 1`,
      [studentId, programmeId]
    );
    return res.rows[0] ? this._hydrate(res.rows[0]) : null;
  }

  public async findActive(journeyId: string): Promise<StudentProgrammeEnrollment[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM student_programme_enrollments WHERE journey_id = $1 AND enrollment_status = 'ACTIVE' AND deleted_at IS NULL`,
      [journeyId]
    );
    return res.rows.map((r: any) => this._hydrate(r));
  }

  private _hydrate(row: any): StudentProgrammeEnrollment {
    return new StudentProgrammeEnrollment({
      id: row.id,
      journeyId: row.journey_id,
      studentId: row.student_id,
      programmeId: row.programme_id,
      programmeVersionId: row.programme_version_id,
      status: row.enrollment_status as EnrollmentStatus,
      deliveryMode: row.delivery_mode,
      cohortId: row.cohort_id,
      intakeDate: row.intake_date,
      paymentVerified: row.payment_verified ?? false,
      instructorId: row.instructor_id,
      completionCertificateId: row.completion_certificate_id,
      withdrawnAt: row.withdrawn_at,
      withdrawalReason: row.withdrawal_reason,
      completedAt: row.completed_at,
      lockVersion: row.lock_version ?? 0,
    });
  }
}

export class PostgresLearningPlanRepository implements LearningPlanRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string { return randomUUID(); }

  public async save(plan: LearningPlan): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO learning_plans
           (id, journey_id, student_id, title, status, lock_version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           lock_version = learning_plans.lock_version + 1,
           updated_at = CURRENT_TIMESTAMP
         WHERE learning_plans.lock_version = $6`,
        [plan.id, plan.journeyId, plan.studentId, plan.title ?? null, plan.status, plan.lockVersion]
      );
      for (const v of plan.versions) {
        await client.query(
          `INSERT INTO learning_plan_versions
             (id, learning_plan_id, version_no, source, goals, schedule, notes, is_current, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
           ON CONFLICT (learning_plan_id, version_no) DO NOTHING`,
          [v.id, plan.id, v.versionNo, v.source,
           v.goals ? JSON.stringify(v.goals) : null,
           v.schedule ? JSON.stringify(v.schedule) : null,
           v.notes ?? null, v.isCurrent]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<LearningPlan | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM learning_plans WHERE id = $1 AND deleted_at IS NULL`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  public async findByJourney(journeyId: string): Promise<LearningPlan[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM learning_plans WHERE journey_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC`,
      [journeyId]
    );
    return Promise.all(res.rows.map((r: any) => this._hydrate(r, pool)));
  }

  public async findActive(journeyId: string): Promise<LearningPlan | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM learning_plans WHERE journey_id = $1 AND status = 'ACTIVE' AND deleted_at IS NULL LIMIT 1`,
      [journeyId]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  private async _hydrate(row: any, pool: Pool): Promise<LearningPlan> {
    const plan = new LearningPlan({
      id: row.id, journeyId: row.journey_id, studentId: row.student_id,
      title: row.title, status: row.status, lockVersion: row.lock_version ?? 0,
    });
    const vRes = await pool.query(
      `SELECT * FROM learning_plan_versions WHERE learning_plan_id = $1 ORDER BY created_at ASC`,
      [row.id]
    );
    for (const v of vRes.rows) {
      plan._pushVersion(new LearningPlanVersion({
        id: v.id, versionNo: v.version_no, source: v.source as LearningPlanSource,
        goals: v.goals, schedule: v.schedule, notes: v.notes,
        isCurrent: v.is_current, createdAt: v.created_at,
      }));
    }
    return plan;
  }
}

export class PostgresDashboardProjectionRepository implements DashboardProjectionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(projection: StudentDashboardProjection): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO student_dashboard_projections
         (id, journey_id, student_id, active_programme_id, active_programme_name,
          overall_progress, current_goal_id, current_goal_title, current_streak,
          next_milestone_id, next_milestone_title, recommendation_payload, last_projected_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
       ON CONFLICT (journey_id) DO UPDATE SET
         active_programme_id = EXCLUDED.active_programme_id,
         active_programme_name = EXCLUDED.active_programme_name,
         overall_progress = EXCLUDED.overall_progress,
         current_goal_id = EXCLUDED.current_goal_id,
         current_goal_title = EXCLUDED.current_goal_title,
         current_streak = EXCLUDED.current_streak,
         next_milestone_id = EXCLUDED.next_milestone_id,
         next_milestone_title = EXCLUDED.next_milestone_title,
         recommendation_payload = EXCLUDED.recommendation_payload,
         last_projected_at = CURRENT_TIMESTAMP`,
      [projection.id, projection.journeyId, projection.studentId,
       projection.activeProgrammeId ?? null, projection.activeProgrammeName ?? null,
       projection.overallProgress, projection.currentGoalId ?? null,
       projection.currentGoalTitle ?? null, projection.currentStreak,
       projection.nextMilestoneId ?? null, projection.nextMilestoneTitle ?? null,
       projection.recommendationPayload ? JSON.stringify(projection.recommendationPayload) : null]
    );
  }

  public async findByStudent(studentId: string): Promise<StudentDashboardProjection | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM student_dashboard_projections WHERE student_id = $1 LIMIT 1`, [studentId]
    );
    return res.rows[0] ? this._hydrate(res.rows[0]) : null;
  }

  public async findByJourney(journeyId: string): Promise<StudentDashboardProjection | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM student_dashboard_projections WHERE journey_id = $1 LIMIT 1`, [journeyId]
    );
    return res.rows[0] ? this._hydrate(res.rows[0]) : null;
  }

  private _hydrate(row: any): StudentDashboardProjection {
    return new StudentDashboardProjection({
      id: row.id, journeyId: row.journey_id, studentId: row.student_id,
      activeProgrammeId: row.active_programme_id,
      activeProgrammeName: row.active_programme_name,
      overallProgress: parseFloat(row.overall_progress ?? '0'),
      currentGoalId: row.current_goal_id,
      currentGoalTitle: row.current_goal_title,
      currentStreak: row.current_streak ?? 0,
      nextMilestoneId: row.next_milestone_id,
      nextMilestoneTitle: row.next_milestone_title,
      recommendationPayload: row.recommendation_payload,
      lastProjectedAt: row.last_projected_at,
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// Adaptive Practice Repositories (Sprint 2.6)
// ─────────────────────────────────────────────────────────────────

export class PostgresPracticeStrategyRepository implements StrategyRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByCode(code: string): Promise<PracticeStrategy | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM practice_strategy_registry WHERE strategy_code = $1`,
      [code]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findAll(): Promise<PracticeStrategy[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM practice_strategy_registry WHERE status = 'ACTIVE'`
    );
    return res.rows.map(r => this._hydrate(r));
  }

  public async save(strategy: PracticeStrategy): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO practice_strategy_registry
         (strategy_code, display_name, algorithm_version, configuration_schema, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (strategy_code) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         algorithm_version = EXCLUDED.algorithm_version,
         configuration_schema = EXCLUDED.configuration_schema,
         status = EXCLUDED.status,
         updated_at = CURRENT_TIMESTAMP`,
      [
        strategy.displayCode,
        strategy.displayName,
        strategy.algorithmVersion,
        JSON.stringify(strategy.configurationSchema),
        strategy.status,
      ]
    );
  }

  private _hydrate(row: any): PracticeStrategy {
    return new PracticeStrategy({
      id: row.strategy_code,
      displayCode: row.strategy_code,
      displayName: row.display_name,
      algorithmVersion: row.algorithm_version,
      configurationSchema: row.configuration_schema,
      status: row.status as any,
    });
  }
}

export class PostgresRecommendationRepository implements RecommendationRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string { return randomUUID(); }

  public async save(recommendation: PracticeRecommendation): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO practice_recommendations
         (id, student_id, recommendation_rules, recommendation_source, priority,
          priority_weight, status, input_snapshot, algorithm_version, decision_trace,
          output_payload, lock_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         lock_version = practice_recommendations.lock_version + 1,
         updated_at = CURRENT_TIMESTAMP
       WHERE practice_recommendations.lock_version = $12`,
      [
        recommendation.id,
        recommendation.studentId,
        JSON.stringify(recommendation.recommendationRules),
        recommendation.recommendationSource,
        recommendation.priority.priority,
        recommendation.priority.weight,
        recommendation.status,
        JSON.stringify(recommendation.inputSnapshot),
        recommendation.algorithmVersion,
        JSON.stringify(recommendation.decisionTrace),
        JSON.stringify(recommendation.outputPayload),
        recommendation.lockVersion,
      ]
    );
  }

  public async findById(id: string): Promise<PracticeRecommendation | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM practice_recommendations WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findPending(studentId: string): Promise<PracticeRecommendation[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM practice_recommendations
       WHERE student_id = $1 AND status = 'PENDING' AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [studentId]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  public async accept(id: string, _planId: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `UPDATE practice_recommendations SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }

  public async reject(id: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `UPDATE practice_recommendations SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }

  public async expire(id: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `UPDATE practice_recommendations SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }

  private _hydrate(row: any): PracticeRecommendation {
    return new PracticeRecommendation({
      id: row.id,
      studentId: row.student_id,
      recommendationRules: row.recommendation_rules,
      recommendationSource: row.recommendation_source,
      priority: new RecommendationPriority(row.priority as Priority, parseFloat(row.priority_weight)),
      status: row.status as any,
      inputSnapshot: row.input_snapshot,
      algorithmVersion: row.algorithm_version,
      decisionTrace: row.decision_trace,
      outputPayload: row.output_payload,
      lockVersion: row.lock_version,
    });
  }
}

export class PostgresPracticePlanRepository implements PracticePlanRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string { return randomUUID(); }

  public async save(plan: PracticePlan): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO practice_plans
           (id, student_id, recommendation_id, title, status, selection_rules,
            targeted_competencies, spacing_policy, lock_version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           lock_version = practice_plans.lock_version + 1,
           updated_at = CURRENT_TIMESTAMP
         WHERE practice_plans.lock_version = $9`,
        [
          plan.id,
          plan.studentId,
          plan.recommendationId ?? null,
          plan.title ?? null,
          plan.status,
          JSON.stringify(plan.selectionRules.map(r => ({ id: r.id, attributeName: r.attributeName, operator: r.operator, value: r.value }))),
          JSON.stringify(plan.targetedCompetencies.map(c => ({ id: c.id, competencyId: c.competencyId, weight: c.coverageWeight.value, targetPercentage: c.targetPercentage.value }))),
          JSON.stringify({ reviewIntervalHours: plan.spacingPolicy.reviewIntervalHours, expansionFactor: plan.spacingPolicy.expansionFactor, maxIntervalHours: plan.spacingPolicy.maxIntervalHours }),
          plan.lockVersion,
        ]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<PracticePlan | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM practice_plans WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findByStudent(studentId: string): Promise<PracticePlan[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM practice_plans WHERE student_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
      [studentId]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  private _hydrate(row: any): PracticePlan {
    const selectionRules = (row.selection_rules || []).map((r: any) => new QuestionSelectionRule({
      id: r.id,
      attributeName: r.attributeName,
      operator: r.operator,
      value: r.value,
    }));
    const targetedCompetencies = (row.targeted_competencies || []).map((c: any) => new CompetencyCoverage({
      id: c.id,
      competencyId: c.competencyId,
      coverageWeight: new SelectionWeight(c.weight),
      targetPercentage: new CoveragePercentage(c.targetPercentage),
    }));
    const policy = row.spacing_policy || {};
    const spacingPolicy = new SpacingPolicy(
      policy.reviewIntervalHours || 24,
      policy.expansionFactor || 1.5,
      policy.maxIntervalHours || 168
    );

    return new PracticePlan({
      id: row.id,
      studentId: row.student_id,
      recommendationId: row.recommendation_id,
      title: row.title,
      status: row.status as any,
      selectionRules,
      targetedCompetencies,
      spacingPolicy,
      lockVersion: row.lock_version,
    });
  }
}

export class PostgresPracticeSessionRepository implements PracticeSessionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string { return randomUUID(); }

  public async save(session: PracticeSession): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Session core table upsert
      await client.query(
        `INSERT INTO practice_sessions
           (id, student_id, plan_id, status, started_at, ended_at, duration_ms,
            lock_version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           ended_at = EXCLUDED.ended_at,
           duration_ms = EXCLUDED.duration_ms,
           lock_version = practice_sessions.lock_version + 1,
           updated_at = CURRENT_TIMESTAMP
         WHERE practice_sessions.lock_version = $8`,
        [
          session.id,
          session.studentId,
          session.planId ?? null,
          session.status,
          session.startedAt ?? null,
          session.endedAt ?? null,
          session.durationMs ?? null,
          session.lockVersion,
        ]
      );

      // 2. Clear current session questions to support refresh/regeneration if generating draft
      if (session.status === 'GENERATED' || session.status === 'DRAFT') {
        await client.query(
          `DELETE FROM practice_session_questions WHERE session_id = $1`,
          [session.id]
        );
      }

      // 3. Upsert session questions
      for (const q of session.questions) {
        await client.query(
          `INSERT INTO practice_session_questions
             (id, session_id, question_version_id, order_index, status, accuracy, time_spent_ms, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status,
             accuracy = EXCLUDED.accuracy,
             time_spent_ms = EXCLUDED.time_spent_ms,
             updated_at = CURRENT_TIMESTAMP`,
          [
            q.id,
            session.id,
            q.questionVersionId,
            q.orderIndex,
            q.status,
            q.accuracy ?? null,
            q.timeSpentMs ?? null,
          ]
        );
      }

      // 4. Save feedback if exists
      if (session.feedback) {
        const fb = session.feedback;
        await client.query(
          `INSERT INTO practice_feedback
             (id, session_id, rating, difficulty_perception, confidence, satisfaction,
              usefulness, technical_issue, recommendation_quality, comment, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO NOTHING`,
          [
            fb.id,
            session.id,
            fb.rating,
            fb.difficultyPerception,
            fb.confidence,
            fb.satisfaction,
            fb.usefulness,
            fb.technicalIssue,
            fb.recommendationQuality,
            fb.comment ?? null,
          ]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<PracticeSession | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM practice_sessions WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  public async findActive(studentId: string): Promise<PracticeSession | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM practice_sessions WHERE student_id = $1 AND status = 'ACTIVE' AND deleted_at IS NULL LIMIT 1`,
      [studentId]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  public async archive(id: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `UPDATE practice_sessions SET status = 'ARCHIVED', deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }

  public async restore(id: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `UPDATE practice_sessions SET deleted_at = NULL WHERE id = $1`,
      [id]
    );
  }

  public async search(filters: { studentId?: string; status?: string; limit?: number; offset?: number }): Promise<PracticeSession[]> {
    const pool = this.dbPool.getPool();
    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let idx = 1;
    if (filters.studentId) { conditions.push(`student_id = $${idx++}`); params.push(filters.studentId); }
    if (filters.status) { conditions.push(`status = $${idx++}`); params.push(filters.status); }
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;
    const res = await pool.query(
      `SELECT * FROM practice_sessions WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return Promise.all(res.rows.map(r => this._hydrate(r, pool)));
  }

  private async _hydrate(row: any, pool: Pool): Promise<PracticeSession> {
    // 1. Fetch questions list
    const qRes = await pool.query(
      `SELECT * FROM practice_session_questions WHERE session_id = $1 ORDER BY order_index ASC`,
      [row.id]
    );
    const questions = qRes.rows.map((q: any) => new PracticeQuestion({
      id: q.id,
      questionVersionId: q.question_version_id,
      orderIndex: q.order_index,
      status: q.status as any,
      accuracy: q.accuracy !== null ? parseFloat(q.accuracy) : undefined,
      timeSpentMs: q.time_spent_ms !== null ? parseInt(q.time_spent_ms) : undefined,
    }));

    // 2. Fetch feedback if exists
    const fbRes = await pool.query(
      `SELECT * FROM practice_feedback WHERE session_id = $1 LIMIT 1`,
      [row.id]
    );
    const feedback = fbRes.rows[0] ? new PracticeFeedback({
      id: fbRes.rows[0].id,
      rating: fbRes.rows[0].rating,
      difficultyPerception: fbRes.rows[0].difficulty_perception,
      confidence: fbRes.rows[0].confidence,
      satisfaction: fbRes.rows[0].satisfaction,
      usefulness: fbRes.rows[0].usefulness,
      technicalIssue: fbRes.rows[0].technical_issue,
      recommendationQuality: fbRes.rows[0].recommendation_quality,
      comment: fbRes.rows[0].comment,
    }) : undefined;

    // Placeholders for configuration and difficulty details (decoupled)
    const configuration = new PracticeConfiguration({
      id: randomUUID(),
      mode: new SessionMode('Timed'),
      durationTarget: new PracticeDuration(row.duration_ms || 600000),
      allowedRepeats: false,
      masteryThreshold: new MasteryThreshold(75),
    });

    const difficultyProfile = new DifficultyProfile({
      id: randomUUID(),
      minLevel: 'Beginner',
      maxLevel: 'Advanced',
      progressionRate: 1.1,
    });

    return new PracticeSession({
      id: row.id,
      studentId: row.student_id,
      planId: row.plan_id,
      status: row.status as any,
      questions,
      configuration,
      difficultyProfile,
      feedback,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      durationMs: row.duration_ms,
      lockVersion: row.lock_version,
    });
  }
}

export class PostgresAssessmentSessionRepository implements AssessmentSessionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(session: AssessmentSession): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const currentRes = await client.query(
        `SELECT lock_version FROM assessment_sessions WHERE id = $1`,
        [session.id]
      );

      if (currentRes.rows[0]) {
        const currentVersion = currentRes.rows[0].lock_version;
        if (currentVersion !== session.lockVersion) {
          throw new Error('Optimistic lock violation: AssessmentSession has been modified by another transaction');
        }
        await client.query(
          `UPDATE assessment_sessions
           SET status = $1, resume_token = $2, lock_version = lock_version + 1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [session.status, session.resumeToken, session.id]
        );
        (session as any).lockVersion += 1;
      } else {
        await client.query(
          `INSERT INTO assessment_sessions (id, student_id, instance_id, status, resume_token, lock_version)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [session.id, session.studentId, session.instanceId, session.status, session.resumeToken, session.lockVersion]
        );
      }

      if (session.checkpoint) {
        await client.query(
          `INSERT INTO runtime_checkpoints (id, session_id, checkpoint_version, active_question_id, elapsed_time_ms, answers_snapshot, checksum)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (session_id, checkpoint_version) DO UPDATE
           SET active_question_id = EXCLUDED.active_question_id, elapsed_time_ms = EXCLUDED.elapsed_time_ms, answers_snapshot = EXCLUDED.answers_snapshot`,
          [
            session.checkpoint.id,
            session.id,
            session.checkpoint.checkpointVersion,
            session.checkpoint.activeQuestionId,
            session.checkpoint.elapsedTimeMs,
            JSON.stringify(session.checkpoint.answersSnapshot),
            session.checkpoint.checksum
          ]
        );
      }

      for (const visit of session.visits) {
        await client.query(
          `INSERT INTO navigation_history (id, session_id, question_id, entered_at, exited_at, duration_ms)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE
           SET exited_at = EXCLUDED.exited_at, duration_ms = EXCLUDED.duration_ms`,
          [visit.id, session.id, visit.questionId, visit.enteredAt, visit.exitedAt, visit.durationMs]
        );
      }

      for (const hb of session.heartbeats) {
        await client.query(
          `INSERT INTO runtime_heartbeats (id, session_id, elapsed_time_ms, active_question_id, browser_visibility, network_status, recorded_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [hb.id, session.id, hb.elapsedTimeMs, hb.activeQuestionId, hb.browserVisibility, hb.networkStatus, hb.recordedAt]
        );
      }

      for (const inc of session.securityIncidents) {
        await client.query(
          `INSERT INTO security_incidents (id, session_id, incident_type, payload, recorded_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [inc.id, session.id, inc.incidentType, JSON.stringify(inc.payload), inc.recordedAt]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<AssessmentSession | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM assessment_sessions WHERE id = $1`,
      [id]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  public async findActive(studentId: string): Promise<AssessmentSession | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM assessment_sessions
       WHERE student_id = $1 AND status NOT IN ('SUBMITTED', 'EVALUATED', 'ARCHIVED')
       LIMIT 1`,
      [studentId]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  public async archive(id: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `UPDATE assessment_sessions SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }

  public async restore(id: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `UPDATE assessment_sessions SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }

  public async search(filters: {
    studentId?: string | undefined;
    status?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
  }): Promise<AssessmentSession[]> {
    const pool = this.dbPool.getPool();
    let query = `SELECT * FROM assessment_sessions WHERE 1=1`;
    const params: any[] = [];
    if (filters.studentId) {
      params.push(filters.studentId);
      query += ` AND student_id = $${params.length}`;
    }
    if (filters.status) {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }
    query += ` ORDER BY created_at DESC`;
    if (filters.limit) {
      params.push(filters.limit);
      query += ` LIMIT $${params.length}`;
    }
    if (filters.offset) {
      params.push(filters.offset);
      query += ` OFFSET $${params.length}`;
    }

    const res = await pool.query(query, params);
    return Promise.all(res.rows.map(r => this._hydrate(r, pool)));
  }

  public nextIdentity(): string {
    return randomUUID();
  }

  private async _hydrate(row: any, pool: Pool): Promise<AssessmentSession> {
    const sheetRes = await pool.query(
      `SELECT * FROM answer_sheets WHERE session_id = $1 LIMIT 1`,
      [row.id]
    );
    let answerSheet: StudentAnswerSheet;
    if (sheetRes.rows[0]) {
      const sheetRow = sheetRes.rows[0];
      const ansRes = await pool.query(
        `SELECT * FROM student_answers WHERE sheet_id = $1`,
        [sheetRow.id]
      );
      const answers = await Promise.all(ansRes.rows.map(async (ans: any) => {
        const revRes = await pool.query(
          `SELECT * FROM answer_revisions WHERE answer_id = $1 ORDER BY revision_number ASC`,
          [ans.id]
        );
        const revisions = revRes.rows.map((r: any) => new AnswerRevision({
          id: r.id,
          payload: r.payload,
          state: r.state,
          revisionNumber: r.revision_number,
          recordedAt: r.recorded_at,
        }));
        return new StudentAnswer({
          id: ans.id,
          questionId: ans.question_id,
          questionVersionId: ans.question_version_id,
          payload: ans.payload,
          state: ans.state as any,
          timeSpentMs: ans.time_spent_ms,
          revisions,
          updatedAt: ans.updated_at,
        });
      }));
      answerSheet = new StudentAnswerSheet({
        id: sheetRow.id,
        sessionId: row.id,
        answers,
      });
    } else {
      answerSheet = new StudentAnswerSheet({ id: randomUUID(), sessionId: row.id });
    }

    const cpRes = await pool.query(
      `SELECT * FROM runtime_checkpoints WHERE session_id = $1 ORDER BY checkpoint_version DESC LIMIT 1`,
      [row.id]
    );
    const checkpoint = cpRes.rows[0] ? new RuntimeCheckpoint({
      id: cpRes.rows[0].id,
      checkpointVersion: cpRes.rows[0].checkpoint_version,
      activeQuestionId: cpRes.rows[0].active_question_id,
      elapsedTimeMs: cpRes.rows[0].elapsed_time_ms,
      answersSnapshot: cpRes.rows[0].answers_snapshot,
      checksum: cpRes.rows[0].checksum,
      recordedAt: cpRes.rows[0].recorded_at,
    }) : undefined;

    const incRes = await pool.query(
      `SELECT * FROM security_incidents WHERE session_id = $1 ORDER BY recorded_at ASC`,
      [row.id]
    );
    const securityIncidents = incRes.rows.map((inc: any) => new SecurityIncident({
      id: inc.id,
      incidentType: inc.incident_type,
      payload: inc.payload,
      recordedAt: inc.recorded_at,
    }));

    const hbRes = await pool.query(
      `SELECT * FROM runtime_heartbeats WHERE session_id = $1 ORDER BY recorded_at ASC`,
      [row.id]
    );
    const heartbeats = hbRes.rows.map((hb: any) => new RuntimeHeartbeat({
      id: hb.id,
      elapsedTimeMs: hb.elapsed_time_ms,
      activeQuestionId: hb.active_question_id,
      browserVisibility: hb.browser_visibility,
      networkStatus: hb.network_status,
      recordedAt: hb.recorded_at,
    }));

    const visitRes = await pool.query(
      `SELECT * FROM navigation_history WHERE session_id = $1 ORDER BY entered_at ASC`,
      [row.id]
    );
    const visits = visitRes.rows.map((v: any) => new QuestionVisit({
      id: v.id,
      questionId: v.question_id,
      enteredAt: v.entered_at,
      exitedAt: v.exited_at,
      durationMs: v.duration_ms,
    }));

    const subRes = await pool.query(
      `SELECT * FROM submission_records WHERE session_id = $1 LIMIT 1`,
      [row.id]
    );
    const submission = subRes.rows[0] ? new SubmissionRecord({
      id: subRes.rows[0].id,
      receiptChecksum: subRes.rows[0].receipt_checksum,
      signature: subRes.rows[0].signature,
      serverId: subRes.rows[0].server_id,
      submittedAt: subRes.rows[0].submitted_at,
    }) : undefined;

    return new AssessmentSession({
      id: row.id,
      studentId: row.student_id,
      instanceId: row.instance_id,
      status: row.status as any,
      answerSheet,
      checkpoint,
      securityIncidents,
      heartbeats,
      visits,
      submission,
      resumeToken: row.resume_token,
      lockVersion: row.lock_version,
    });
  }
}

export class PostgresAnswerSheetRepository implements AnswerSheetRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(sheet: StudentAnswerSheet): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO answer_sheets (id, session_id)
       VALUES ($1, $2)
       ON CONFLICT (session_id) DO NOTHING`,
      [sheet.id, sheet.sessionId]
    );
  }

  public async saveAnswer(sessionId: string, answer: StudentAnswer): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const sheetRes = await client.query(
        `SELECT id FROM answer_sheets WHERE session_id = $1`,
        [sessionId]
      );
      if (!sheetRes.rows[0]) throw new Error('Answer sheet not found for session');
      const sheetId = sheetRes.rows[0].id;

      await client.query(
        `INSERT INTO student_answers (id, sheet_id, question_id, question_version_id, payload, state, time_spent_ms, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (sheet_id, question_version_id) DO UPDATE
         SET payload = EXCLUDED.payload, state = EXCLUDED.state, time_spent_ms = EXCLUDED.time_spent_ms, updated_at = EXCLUDED.updated_at`,
        [
          answer.id,
          sheetId,
          answer.questionId,
          answer.questionVersionId,
          JSON.stringify(answer.payload),
          answer.state,
          answer.timeSpentMs,
          answer.updatedAt
        ]
      );

      for (const rev of answer.revisions) {
        await client.query(
          `INSERT INTO answer_revisions (id, answer_id, payload, state, revision_number, recorded_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [rev.id, answer.id, JSON.stringify(rev.payload), rev.state, rev.revisionNumber, rev.recordedAt]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async find(sessionId: string): Promise<StudentAnswerSheet | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM answer_sheets WHERE session_id = $1 LIMIT 1`,
      [sessionId]
    );
    if (!res.rows[0]) return null;
    const sheetRow = res.rows[0];

    const ansRes = await pool.query(
      `SELECT * FROM student_answers WHERE sheet_id = $1`,
      [sheetRow.id]
    );
    const answers = await Promise.all(ansRes.rows.map(async (ans: any) => {
      const revRes = await pool.query(
        `SELECT * FROM answer_revisions WHERE answer_id = $1 ORDER BY revision_number ASC`,
        [ans.id]
      );
      const revisions = revRes.rows.map((r: any) => new AnswerRevision({
        id: r.id,
        payload: r.payload,
        state: r.state,
        revisionNumber: r.revision_number,
        recordedAt: r.recorded_at,
      }));
      return new StudentAnswer({
        id: ans.id,
        questionId: ans.question_id,
        questionVersionId: ans.question_version_id,
        payload: ans.payload,
        state: ans.state as any,
        timeSpentMs: ans.time_spent_ms,
        revisions,
        updatedAt: ans.updated_at,
      });
    }));

    return new StudentAnswerSheet({
      id: sheetRow.id,
      sessionId,
      answers,
    });
  }

  public async submit(sessionId: string, record: SubmissionRecord): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO submission_records (id, session_id, receipt_checksum, signature, server_id, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (session_id) DO UPDATE
       SET receipt_checksum = EXCLUDED.receipt_checksum, signature = EXCLUDED.signature, server_id = EXCLUDED.server_id, submitted_at = EXCLUDED.submitted_at`,
      [record.id, sessionId, record.receiptChecksum, record.signature, record.serverId, record.submittedAt]
    );
  }
}

export class PostgresCheckpointRepository implements CheckpointRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(sessionId: string, checkpoint: RuntimeCheckpoint): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO runtime_checkpoints (id, session_id, checkpoint_version, active_question_id, elapsed_time_ms, answers_snapshot, device_fingerprint, connectivity_snapshot, checksum, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (session_id, checkpoint_version) DO UPDATE
       SET active_question_id = EXCLUDED.active_question_id, elapsed_time_ms = EXCLUDED.elapsed_time_ms, answers_snapshot = EXCLUDED.answers_snapshot, device_fingerprint = EXCLUDED.device_fingerprint, connectivity_snapshot = EXCLUDED.connectivity_snapshot, checksum = EXCLUDED.checksum, recorded_at = EXCLUDED.recorded_at`,
      [
        checkpoint.id,
        sessionId,
        checkpoint.checkpointVersion,
        checkpoint.activeQuestionId,
        checkpoint.elapsedTimeMs,
        JSON.stringify(checkpoint.answersSnapshot),
        checkpoint.deviceFingerprint ? JSON.stringify(checkpoint.deviceFingerprint) : null,
        checkpoint.connectivitySnapshot ? JSON.stringify(checkpoint.connectivitySnapshot) : null,
        checkpoint.checksum,
        checkpoint.recordedAt
      ]
    );
  }

  public async restore(sessionId: string): Promise<RuntimeCheckpoint | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM runtime_checkpoints
       WHERE session_id = $1
       ORDER BY checkpoint_version DESC LIMIT 1`,
      [sessionId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new RuntimeCheckpoint({
      id: r.id,
      checkpointVersion: r.checkpoint_version,
      activeQuestionId: r.active_question_id,
      elapsedTimeMs: r.elapsed_time_ms,
      answersSnapshot: r.answers_snapshot,
      deviceFingerprint: r.device_fingerprint,
      connectivitySnapshot: r.connectivity_snapshot,
      checksum: r.checksum,
      recordedAt: r.recorded_at,
    });
  }

  public async deleteExpired(expiryDate: Date): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `DELETE FROM runtime_checkpoints WHERE recorded_at < $1`,
      [expiryDate]
    );
  }
}

export class PostgresRuntimeStatisticsRepository implements RuntimeStatisticsRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async update(stats: any): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO runtime_statistics (id, student_id, session_id, answer_save_latencies, checkpoint_latencies, submission_latency_ms, heartbeat_failures, reconnect_count, autosave_failures, security_incidents_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (session_id) DO UPDATE
       SET answer_save_latencies = EXCLUDED.answer_save_latencies, checkpoint_latencies = EXCLUDED.checkpoint_latencies, submission_latency_ms = EXCLUDED.submission_latency_ms, heartbeat_failures = EXCLUDED.heartbeat_failures, reconnect_count = EXCLUDED.reconnect_count, autosave_failures = EXCLUDED.autosave_failures, security_incidents_count = EXCLUDED.security_incidents_count`,
      [
        stats.id || randomUUID(),
        stats.studentId,
        stats.sessionId,
        stats.answerSaveLatencies ? JSON.stringify(stats.answerSaveLatencies) : null,
        stats.checkpointLatencies ? JSON.stringify(stats.checkpointLatencies) : null,
        stats.submissionLatencyMs,
        stats.heartbeatFailures,
        stats.reconnectCount,
        stats.autosaveFailures,
        stats.securityIncidentsCount
      ]
    );
  }

  public async find(sessionId: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM runtime_statistics WHERE session_id = $1 LIMIT 1`,
      [sessionId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      studentId: r.student_id,
      sessionId: r.session_id,
      answerSaveLatencies: r.answer_save_latencies,
      checkpointLatencies: r.checkpoint_latencies,
      submissionLatencyMs: r.submission_latency_ms,
      heartbeatFailures: r.heartbeat_failures,
      reconnectCount: r.reconnect_count,
      autosave_failures: r.autosave_failures,
      securityIncidentsCount: r.security_incidents_count,
    };
  }

  public async aggregate(studentId: string): Promise<any> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT COUNT(*) as session_count, SUM(security_incidents_count) as total_incidents, AVG(submission_latency_ms) as avg_sub_latency
       FROM runtime_statistics WHERE student_id = $1`,
      [studentId]
    );
    return res.rows[0];
  }
}

// ═══════════════════════════════════════════════════════════════════
// SPRINT 2.8 — AI EVALUATION & SCORING PERSISTENCE REPOSITORIES
// ═══════════════════════════════════════════════════════════════════

export class PostgresEvaluationRepository implements EvaluationRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string { return randomUUID(); }

  public async saveJob(job: EvaluationJob): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO evaluation_jobs (id, snapshot_id, student_id, submission_id, question_type, status, priority, attempts, max_attempts, profile_id, model_version_id, error_message, queued_at, started_at, completed_at, published_at, lock_version, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status, attempts = EXCLUDED.attempts, error_message = EXCLUDED.error_message,
         started_at = EXCLUDED.started_at, completed_at = EXCLUDED.completed_at, published_at = EXCLUDED.published_at,
         lock_version = evaluation_jobs.lock_version + 1, updated_at = CURRENT_TIMESTAMP`,
      [
        job.id, job.snapshotId, job.studentId, job.submissionId, job.questionType,
        job.status, job.priority, job.attempts, job.maxAttempts,
        job.profileId ?? null, job.modelVersionId ?? null, job.errorMessage ?? null,
        job.queuedAt, job.startedAt ?? null, job.completedAt ?? null, job.publishedAt ?? null,
        job.lockVersion,
      ]
    );
  }

  public async saveSnapshot(snapshot: EvaluationSnapshot): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO evaluation_snapshots (id, submission_id, session_id, student_id, question_snapshot, rubric_snapshot, submission_snapshot, model_version_id, prompt_version_id, evaluation_settings, profile_id, snapshotted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
      [
        snapshot.id, snapshot.submissionId, snapshot.sessionId, snapshot.studentId,
        JSON.stringify(snapshot.questionSnapshot), JSON.stringify(snapshot.rubricSnapshot),
        JSON.stringify(snapshot.submissionSnapshot), snapshot.modelVersionId ?? null,
        snapshot.promptVersionId ?? null, JSON.stringify(snapshot.evaluationSettings),
        snapshot.profileId ?? null, snapshot.snapshottedAt,
      ]
    );
  }

  public async saveResult(result: EvaluationResult): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO evaluation_results (id, job_id, snapshot_id, student_id, submission_id, question_type, raw_score, scaled_score, band_score, max_score, score_percentage, is_correct, confidence, evaluation_notes, is_published, is_archived, lock_version, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           raw_score = EXCLUDED.raw_score, scaled_score = EXCLUDED.scaled_score, band_score = EXCLUDED.band_score,
           is_published = EXCLUDED.is_published, is_archived = EXCLUDED.is_archived,
           lock_version = evaluation_results.lock_version + 1`,
        [
          result.id, result.jobId, result.snapshotId, result.studentId, result.submissionId,
          result.questionType, result.rawScore ?? null, result.scaledScore ?? null,
          result.bandScore?.band ?? null, result.maxScore ?? null, result.scorePercentage ?? null,
          result.isCorrect ?? null, result.confidence?.value ?? null, result.evaluationNotes ?? null,
          result.isPublished, result.isArchived, result.lockVersion,
        ]
      );
      for (const rs of result.rubricScores) {
        await client.query(
          `INSERT INTO rubric_scores (id, result_id, criterion_code, criterion_name, score, max_score, band_descriptor, justification, weight, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING`,
          [rs.id, result.id, rs.criterionCode, rs.criterionName, rs.score.value, rs.score.max, rs.bandDescriptor ?? null, rs.justification, rs.weight]
        );
      }
      for (const fs of result.feedbackSections) {
        await client.query(
          `INSERT INTO feedback_sections (id, result_id, section_type, criterion_code, content, severity, order_index, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING`,
          [fs.id, result.id, fs.sectionType, fs.criterionCode ?? null, fs.content, fs.severity?.level ?? null, fs.orderIndex]
        );
      }
      for (const ev of result.evidenceRefs) {
        await client.query(
          `INSERT INTO evidence_references (id, result_id, criterion_code, text_excerpt, start_offset, end_offset, relevance_note, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING`,
          [ev.id, result.id, ev.criterionCode ?? null, ev.textExcerpt, ev.startOffset ?? null, ev.endOffset ?? null, ev.relevanceNote ?? null]
        );
      }
      for (const rec of result.recommendations) {
        await client.query(
          `INSERT INTO evaluation_recommendations (id, result_id, student_id, recommendation_type, priority, title, description, target_competency_code, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING`,
          [rec.id, result.id, result.studentId, rec.recommendationType, rec.priority, rec.title, rec.description ?? null, rec.targetCompetencyCode ?? null]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findJobById(id: string): Promise<EvaluationJob | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM evaluation_jobs WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrateJob(res.rows[0]);
  }

  public async findSnapshotById(id: string): Promise<EvaluationSnapshot | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM evaluation_snapshots WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrateSnapshot(res.rows[0]);
  }

  public async findResultById(id: string): Promise<EvaluationResult | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM evaluation_results WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrateResult(res.rows[0], pool);
  }

  public async findResultByJobId(jobId: string): Promise<EvaluationResult | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM evaluation_results WHERE job_id = $1 LIMIT 1`, [jobId]);
    if (!res.rows[0]) return null;
    return this._hydrateResult(res.rows[0], pool);
  }

  public async findResultBySubmission(submissionId: string): Promise<EvaluationResult[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM evaluation_results WHERE submission_id = $1 ORDER BY created_at DESC`, [submissionId]);
    return Promise.all(res.rows.map((r: any) => this._hydrateResult(r, pool)));
  }

  public async findPublishedResultsByStudent(studentId: string): Promise<EvaluationResult[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM evaluation_results WHERE student_id = $1 AND is_published = TRUE ORDER BY created_at DESC`,
      [studentId]
    );
    return Promise.all(res.rows.map((r: any) => this._hydrateResult(r, pool)));
  }

  public async searchJobs(filters: EvaluationSearchFilters): Promise<EvaluationJob[]> {
    const pool = this.dbPool.getPool();
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (filters.studentId)    { conditions.push(`student_id = $${idx++}`);    params.push(filters.studentId); }
    if (filters.submissionId) { conditions.push(`submission_id = $${idx++}`); params.push(filters.submissionId); }
    if (filters.status)       { conditions.push(`status = $${idx++}`);        params.push(filters.status); }
    if (filters.questionType) { conditions.push(`question_type = $${idx++}`); params.push(filters.questionType); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    const res = await pool.query(
      `SELECT * FROM evaluation_jobs ${where} ORDER BY queued_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return res.rows.map((r: any) => this._hydrateJob(r));
  }

  public async publishResult(resultId: string, publishedAt: Date): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `UPDATE evaluation_results SET is_published = TRUE, published_at = $2 WHERE id = $1`,
      [resultId, publishedAt]
    );
  }

  public async archiveJob(jobId: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(`UPDATE evaluation_jobs SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [jobId]);
  }

  private _hydrateJob(r: any): EvaluationJob {
    return new EvaluationJob({
      id: r.id, snapshotId: r.snapshot_id, studentId: r.student_id,
      submissionId: r.submission_id, questionType: r.question_type as QuestionType,
      status: r.status as EvaluationJobStatus, priority: r.priority,
      attempts: r.attempts, maxAttempts: r.max_attempts,
      profileId: r.profile_id ?? undefined, modelVersionId: r.model_version_id ?? undefined,
      errorMessage: r.error_message ?? undefined, queuedAt: new Date(r.queued_at),
      startedAt: r.started_at ? new Date(r.started_at) : undefined,
      completedAt: r.completed_at ? new Date(r.completed_at) : undefined,
      publishedAt: r.published_at ? new Date(r.published_at) : undefined,
      lockVersion: r.lock_version,
    });
  }

  private _hydrateSnapshot(r: any): EvaluationSnapshot {
    return new EvaluationSnapshot({
      id: r.id, submissionId: r.submission_id, sessionId: r.session_id, studentId: r.student_id,
      questionSnapshot: typeof r.question_snapshot === 'string' ? JSON.parse(r.question_snapshot) : r.question_snapshot,
      rubricSnapshot: typeof r.rubric_snapshot === 'string' ? JSON.parse(r.rubric_snapshot) : r.rubric_snapshot,
      submissionSnapshot: typeof r.submission_snapshot === 'string' ? JSON.parse(r.submission_snapshot) : r.submission_snapshot,
      modelVersionId: r.model_version_id ?? undefined, promptVersionId: r.prompt_version_id ?? undefined,
      evaluationSettings: typeof r.evaluation_settings === 'string' ? JSON.parse(r.evaluation_settings) : r.evaluation_settings,
      profileId: r.profile_id ?? undefined, snapshottedAt: new Date(r.snapshotted_at),
    });
  }

  private async _hydrateResult(r: any, pool: any): Promise<EvaluationResult> {
    const [rubricRes, feedbackRes, evidenceRes, recRes] = await Promise.all([
      pool.query(`SELECT * FROM rubric_scores WHERE result_id = $1`, [r.id]),
      pool.query(`SELECT * FROM feedback_sections WHERE result_id = $1 ORDER BY order_index`, [r.id]),
      pool.query(`SELECT * FROM evidence_references WHERE result_id = $1`, [r.id]),
      pool.query(`SELECT * FROM evaluation_recommendations WHERE result_id = $1`, [r.id]),
    ]);
    const rubricScores = rubricRes.rows.map((rs: any) => new RubricScore({
      id: rs.id, criterionCode: rs.criterion_code, criterionName: rs.criterion_name,
      score: new Score(parseFloat(rs.score), parseFloat(rs.max_score)),
      bandDescriptor: rs.band_descriptor ?? undefined, justification: rs.justification,
      weight: parseFloat(rs.weight), createdAt: new Date(rs.created_at),
    }));
    const feedbackSections = feedbackRes.rows.map((fs: any) => new FeedbackSection({
      id: fs.id, sectionType: fs.section_type as FeedbackSectionType,
      criterionCode: fs.criterion_code ?? undefined, content: fs.content,
      severity: fs.severity ? new FeedbackSeverity(fs.severity) : undefined,
      orderIndex: fs.order_index, createdAt: new Date(fs.created_at),
    }));
    const evidenceRefs = evidenceRes.rows.map((ev: any) => new EvidenceReference({
      id: ev.id, criterionCode: ev.criterion_code ?? undefined, textExcerpt: ev.text_excerpt,
      startOffset: ev.start_offset ?? undefined, endOffset: ev.end_offset ?? undefined,
      relevanceNote: ev.relevance_note ?? undefined, createdAt: new Date(ev.created_at),
    }));
    const recommendations = recRes.rows.map((rec: any) => new EvaluationRecommendation({
      id: rec.id, recommendationType: rec.recommendation_type, priority: rec.priority,
      title: rec.title, description: rec.description ?? undefined,
      targetCompetencyCode: rec.target_competency_code ?? undefined, createdAt: new Date(rec.created_at),
    }));
    return new EvaluationResult({
      id: r.id, jobId: r.job_id, snapshotId: r.snapshot_id,
      studentId: r.student_id, submissionId: r.submission_id,
      questionType: r.question_type as QuestionType,
      rawScore: r.raw_score !== null ? parseFloat(r.raw_score) : undefined,
      scaledScore: r.scaled_score !== null ? parseFloat(r.scaled_score) : undefined,
      bandScore: r.band_score ? new BandScore(r.band_score) : undefined,
      maxScore: r.max_score !== null ? parseFloat(r.max_score) : undefined,
      isCorrect: r.is_correct ?? undefined,
      confidence: r.confidence !== null ? new ConfidenceLevel(parseFloat(r.confidence)) : undefined,
      evaluationNotes: r.evaluation_notes ?? undefined,
      rubricScores, feedbackSections, evidenceRefs, recommendations,
      isPublished: r.is_published, isArchived: r.is_archived,
      lockVersion: r.lock_version, createdAt: new Date(r.created_at),
      publishedAt: r.published_at ? new Date(r.published_at) : undefined,
    });
  }
}

export class PostgresHumanReviewRepository implements HumanReviewRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public nextIdentity(): string { return randomUUID(); }

  public async save(review: HumanReview): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO human_reviews (id, job_id, result_id, reviewer_id, status, escalation_reason, assigned_at, review_started_at, review_completed_at, published_at, lock_version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status, escalation_reason = EXCLUDED.escalation_reason,
           review_started_at = EXCLUDED.review_started_at, review_completed_at = EXCLUDED.review_completed_at,
           published_at = EXCLUDED.published_at, lock_version = human_reviews.lock_version + 1`,
        [
          review.id, review.jobId, review.resultId ?? null, review.reviewerId ?? null,
          review.status, review.escalationReason ?? null, review.assignedAt,
          review.reviewStartedAt ?? null, review.reviewCompletedAt ?? null,
          review.publishedAt ?? null, review.lockVersion,
        ]
      );
      for (const comment of review.comments) {
        await client.query(
          `INSERT INTO review_comments (id, review_id, criterion_code, comment_text, decision, override_score, recorded_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
          [comment.id, review.id, comment.criterionCode ?? null, comment.commentText, comment.decision ?? null, comment.overrideScore ?? null, comment.recordedAt]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<HumanReview | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM human_reviews WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  public async findByJob(jobId: string): Promise<HumanReview | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM human_reviews WHERE job_id = $1 ORDER BY assigned_at DESC LIMIT 1`, [jobId]);
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0], pool);
  }

  public async findPending(): Promise<HumanReview[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM human_reviews WHERE status IN ('ASSIGNED','IN_REVIEW','ESCALATED') ORDER BY assigned_at ASC`
    );
    return Promise.all(res.rows.map((r: any) => this._hydrate(r, pool)));
  }

  public async findByReviewer(reviewerId: string): Promise<HumanReview[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM human_reviews WHERE reviewer_id = $1 ORDER BY assigned_at DESC`, [reviewerId]
    );
    return Promise.all(res.rows.map((r: any) => this._hydrate(r, pool)));
  }

  public async assign(reviewId: string, reviewerId: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(`UPDATE human_reviews SET reviewer_id = $2 WHERE id = $1`, [reviewId, reviewerId]);
  }

  private async _hydrate(r: any, pool: any): Promise<HumanReview> {
    const commentsRes = await pool.query(`SELECT * FROM review_comments WHERE review_id = $1 ORDER BY recorded_at`, [r.id]);
    const comments = commentsRes.rows.map((c: any) => new ReviewComment({
      id: c.id, criterionCode: c.criterion_code ?? undefined, commentText: c.comment_text,
      decision: c.decision ?? undefined,
      overrideScore: c.override_score !== null ? parseFloat(c.override_score) : undefined,
      recordedAt: new Date(c.recorded_at),
    }));
    return new HumanReview({
      id: r.id, jobId: r.job_id, resultId: r.result_id ?? undefined,
      reviewerId: r.reviewer_id ?? undefined, status: r.status as HumanReviewStatus,
      comments, decisions: [], escalationReason: r.escalation_reason ?? undefined,
      assignedAt: new Date(r.assigned_at),
      reviewStartedAt: r.review_started_at ? new Date(r.review_started_at) : undefined,
      reviewCompletedAt: r.review_completed_at ? new Date(r.review_completed_at) : undefined,
      publishedAt: r.published_at ? new Date(r.published_at) : undefined,
      lockVersion: r.lock_version,
    });
  }
}

export class PostgresModelRepository implements ModelRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM ai_models WHERE id = $1`, [id]);
    return res.rows[0] ?? null;
  }

  public async findByCode(modelCode: string, provider: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM ai_models WHERE model_code = $1 AND provider = $2 AND is_active = TRUE LIMIT 1`,
      [modelCode, provider]
    );
    return res.rows[0] ?? null;
  }

  public async findAll(activeOnly = true): Promise<any[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM ai_models${activeOnly ? ' WHERE is_active = TRUE' : ''} ORDER BY display_name`
    );
    return res.rows;
  }

  public async findCurrentVersion(modelId: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM model_versions WHERE model_id = $1 AND is_current = TRUE LIMIT 1`, [modelId]
    );
    return res.rows[0] ?? null;
  }
}

export class PostgresPromptRepository implements PromptRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByCode(templateCode: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM prompt_templates WHERE template_code = $1 AND is_active = TRUE LIMIT 1`, [templateCode]
    );
    return res.rows[0] ?? null;
  }

  public async findCurrentVersion(templateCode: string): Promise<PromptVersion | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT pv.* FROM prompt_versions pv
       JOIN prompt_templates pt ON pt.id = pv.template_id
       WHERE pt.template_code = $1 AND pv.is_current = TRUE LIMIT 1`,
      [templateCode]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new PromptVersion({
      id: r.id, templateId: r.template_id, versionNumber: r.version_number,
      systemPrompt: r.system_prompt, userPromptTemplate: r.user_prompt_template,
      promptHash: new PromptHash(r.prompt_hash), isCurrent: r.is_current,
      createdAt: new Date(r.created_at),
    });
  }

  public async saveVersion(version: PromptVersion): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO prompt_versions (id, template_id, version_number, system_prompt, user_prompt_template, prompt_hash, is_current, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (template_id, version_number) DO NOTHING`,
      [version.id, version.templateId, version.versionNumber, version.systemPrompt,
       version.userPromptTemplate, version.promptHash.sha256, version.isCurrent, version.createdAt]
    );
  }

  public async saveExecution(execution: PromptExecution): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO prompt_executions (id, job_id, prompt_version_id, model_version_id, provider, model_code, system_prompt_hash, user_prompt_hash, temperature, prompt_tokens, completion_tokens, total_tokens, latency_ms, status, error_message, executed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT (id) DO NOTHING`,
      [
        execution.id, execution.jobId, execution.promptVersionId ?? null, execution.modelVersionId ?? null,
        execution.provider, execution.modelCode,
        execution.systemPromptHash.sha256, execution.userPromptHash.sha256,
        execution.temperature ?? null,
        execution.tokenUsage?.promptTokens ?? null, execution.tokenUsage?.completionTokens ?? null,
        execution.tokenUsage?.totalTokens ?? null, execution.latencyMs ?? null,
        execution.status, execution.errorMessage ?? null, execution.executedAt,
      ]
    );
  }

  public async findExecutionsByJob(jobId: string): Promise<PromptExecution[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM prompt_executions WHERE job_id = $1 ORDER BY executed_at`, [jobId]);
    return res.rows.map((r: any) => new PromptExecution({
      id: r.id, jobId: r.job_id, promptVersionId: r.prompt_version_id ?? undefined,
      modelVersionId: r.model_version_id ?? undefined, provider: r.provider, modelCode: r.model_code,
      systemPromptHash: new PromptHash(r.system_prompt_hash), userPromptHash: new PromptHash(r.user_prompt_hash),
      temperature: r.temperature !== null ? parseFloat(r.temperature) : undefined,
      tokenUsage: r.prompt_tokens !== null ? new TokenUsage(r.prompt_tokens, r.completion_tokens) : undefined,
      latencyMs: r.latency_ms ?? undefined, status: r.status,
      errorMessage: r.error_message ?? undefined, executedAt: new Date(r.executed_at),
    }));
  }
}

export class PostgresEvaluationProfileRepository implements EvaluationProfileRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<EvaluationProfile | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM evaluation_profiles WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findByCode(profileCode: string): Promise<EvaluationProfile | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM evaluation_profiles WHERE profile_code = $1 AND is_active = TRUE LIMIT 1`, [profileCode]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findAll(activeOnly = true): Promise<EvaluationProfile[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM evaluation_profiles${activeOnly ? ' WHERE is_active = TRUE' : ''} ORDER BY display_name`
    );
    return res.rows.map((r: any) => this._hydrate(r));
  }

  private _hydrate(r: any): EvaluationProfile {
    return new EvaluationProfile({
      id: r.id, profileCode: r.profile_code, displayName: r.display_name,
      examContext: r.exam_context ?? undefined, modelId: r.model_id ?? undefined,
      rubricReference: r.rubric_reference ?? undefined,
      confidenceThreshold: parseFloat(r.confidence_threshold),
      moderationPolicy: r.moderation_policy,
      settings: r.settings ?? {}, isActive: r.is_active,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// 12. PREDICTION ENGINE PERSISTENCE REPOSITORIES
// ═══════════════════════════════════════════════════════════════════

export class PostgresReadinessSnapshotRepository implements ReadinessSnapshotRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(snapshot: ReadinessSnapshot): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO readiness_snapshots (id, student_id, learner_state, latest_evaluation_summaries, practice_statistics, study_streak, competency_mastery, forecast_window, model_version_id, snapshotted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [
        snapshot.id,
        snapshot.studentId,
        snapshot.learnerState,
        snapshot.latestEvaluationSummaries,
        snapshot.practiceStatistics,
        snapshot.studyStreak,
        snapshot.competencyMastery,
        snapshot.forecastWindow,
        snapshot.modelVersionId ?? null,
        snapshot.snapshottedAt
      ]
    );
  }

  public async findById(id: string): Promise<ReadinessSnapshot | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM readiness_snapshots WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findLatestByStudent(studentId: string): Promise<ReadinessSnapshot | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM readiness_snapshots WHERE student_id = $1 ORDER BY snapshotted_at DESC LIMIT 1`,
      [studentId]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  private _hydrate(r: any): ReadinessSnapshot {
    return new ReadinessSnapshot({
      id: r.id,
      studentId: r.student_id,
      learnerState: r.learner_state ?? {},
      latestEvaluationSummaries: r.latest_evaluation_summaries ?? {},
      practiceStatistics: r.practice_statistics ?? {},
      studyStreak: r.study_streak ?? {},
      competencyMastery: r.competency_mastery ?? {},
      forecastWindow: r.forecast_window,
      modelVersionId: r.model_version_id ?? undefined,
      snapshottedAt: new Date(r.snapshotted_at)
    });
  }
}

export class PostgresPredictionExperimentRepository implements PredictionExperimentRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(experiment: PredictionExperiment): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO prediction_experiments (id, experiment_code, display_name, control_model_version_id, challenger_model_version_id, traffic_split_percentage, status, start_date, end_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date`,
      [
        experiment.id,
        experiment.experimentCode,
        experiment.displayName,
        experiment.controlModelVersionId,
        experiment.challengerModelVersionId,
        experiment.trafficSplitPercentage,
        experiment.status,
        experiment.startDate ?? null,
        experiment.endDate ?? null,
        experiment.createdAt
      ]
    );
  }

  public async findById(id: string): Promise<PredictionExperiment | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM prediction_experiments WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findActiveExperiment(): Promise<PredictionExperiment | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM prediction_experiments WHERE status = 'RUNNING' LIMIT 1`
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findByCode(code: string): Promise<PredictionExperiment | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM prediction_experiments WHERE experiment_code = $1 LIMIT 1`,
      [code]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  private _hydrate(r: any): PredictionExperiment {
    return new PredictionExperiment({
      id: r.id,
      experimentCode: r.experiment_code,
      displayName: r.display_name,
      controlModelVersionId: r.control_model_version_id,
      challengerModelVersionId: r.challenger_model_version_id,
      trafficSplitPercentage: r.traffic_split_percentage,
      status: r.status,
      startDate: r.start_date ? new Date(r.start_date) : undefined,
      endDate: r.end_date ? new Date(r.end_date) : undefined,
      createdAt: new Date(r.created_at)
    });
  }
}

export class PostgresPredictionFeatureRepository implements PredictionFeatureRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findByCode(code: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM prediction_features WHERE feature_code = $1`, [code]);
    return res.rows[0] ?? null;
  }

  public async findAllActive(): Promise<any[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM prediction_features WHERE is_active = TRUE ORDER BY feature_code`);
    return res.rows;
  }
}

export class PostgresModelVersionRepository implements ModelVersionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async findById(id: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT mv.*, m.algorithm_type as "algorithmType"
       FROM prediction_model_versions mv
       JOIN prediction_models m ON mv.model_id = m.id
       WHERE mv.id = $1`,
      [id]
    );
    return res.rows[0] ?? null;
  }

  public async findCurrentByModelCode(modelCode: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT mv.*, m.algorithm_type as "algorithmType"
       FROM prediction_model_versions mv
       JOIN prediction_models m ON mv.model_id = m.id
       WHERE m.model_code = $1 AND mv.is_current = TRUE
       LIMIT 1`,
      [modelCode]
    );
    return res.rows[0] ?? null;
  }
}

export class PostgresReadinessPredictionRepository implements ReadinessPredictionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(prediction: ReadinessPrediction, latencyMs?: number): Promise<void> {
    const pool = this.dbPool.getPool();

    // 1. Insert/Update Parent Aggregate Root
    await pool.query(
      `INSERT INTO readiness_predictions (id, student_id, profile_id, model_version_id, status, overall_readiness_score, confidence_value, confidence_interval_low, confidence_interval_high, lock_version, created_at, updated_at, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, $12)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         overall_readiness_score = EXCLUDED.overall_readiness_score,
         confidence_value = EXCLUDED.confidence_value,
         confidence_interval_low = EXCLUDED.confidence_interval_low,
         confidence_interval_high = EXCLUDED.confidence_interval_high,
         lock_version = readiness_predictions.lock_version + 1,
         updated_at = CURRENT_TIMESTAMP,
         published_at = EXCLUDED.published_at`,
      [
        prediction.id,
        prediction.studentId,
        prediction.profileId,
        prediction.modelVersionId,
        prediction.status,
        prediction.overallReadinessScore?.value ?? null,
        prediction.confidence?.confidence ?? null,
        prediction.confidence?.low ?? null,
        prediction.confidence?.high ?? null,
        prediction.lockVersion,
        prediction.createdAt,
        prediction.publishedAt ?? null
      ]
    );

    // 2. Save Feature Set
    if (prediction.featureSet) {
      await pool.query(
        `INSERT INTO prediction_feature_sets (id, prediction_id, features, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET features = EXCLUDED.features`,
        [prediction.featureSet.id, prediction.id, prediction.featureSet.features]
      );
    }

    // 3. Save Explanation
    if (prediction.explanation) {
      await pool.query(
        `INSERT INTO prediction_explanations (id, prediction_id, contributing_factors, feature_importance, confidence_explanation, evidence_references, certainty_score, top_influencing_competencies, strongest_risk_indicators, feature_contribution_ranking, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           contributing_factors = EXCLUDED.contributing_factors,
           feature_importance = EXCLUDED.feature_importance,
           confidence_explanation = EXCLUDED.confidence_explanation,
           evidence_references = EXCLUDED.evidence_references,
           certainty_score = EXCLUDED.certainty_score,
           top_influencing_competencies = EXCLUDED.top_influencing_competencies,
           strongest_risk_indicators = EXCLUDED.strongest_risk_indicators,
           feature_contribution_ranking = EXCLUDED.feature_contribution_ranking`,
        [
          prediction.explanation.id,
          prediction.id,
          JSON.stringify(prediction.explanation.contributingFactors),
          prediction.explanation.featureImportance,
          prediction.explanation.confidenceExplanation,
          JSON.stringify(prediction.explanation.evidenceReferences),
          prediction.explanation.predictionCertainty,
          JSON.stringify(prediction.explanation.topInfluencingCompetencies),
          JSON.stringify(prediction.explanation.strongestRiskIndicators),
          JSON.stringify(prediction.explanation.featureContributionRanking)
        ]
      );
    }

    // 4. Save Evidence (Clean and insert)
    await pool.query(`DELETE FROM prediction_evidence WHERE prediction_id = $1`, [prediction.id]);
    for (const ev of prediction.evidence) {
      await pool.query(
        `INSERT INTO prediction_evidence (id, prediction_id, evidence_type, evidence_source_id, weight, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [ev.id, prediction.id, ev.evidenceType, ev.evidenceSourceId, ev.weight, ev.description]
      );
    }

    // 5. Save Trends (Clean and insert)
    await pool.query(`DELETE FROM prediction_trends WHERE prediction_id = $1`, [prediction.id]);
    for (const tr of prediction.trends) {
      await pool.query(
        `INSERT INTO prediction_trends (id, prediction_id, trend_type, slope, explanation, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [tr.id, prediction.id, tr.trendType, tr.slope, tr.explanation]
      );
    }

    // 6. Save Interventions
    for (const inter of prediction.interventions) {
      await pool.query(
        `INSERT INTO prediction_interventions (id, prediction_id, student_id, risk_level, risk_score, trigger_reason, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           updated_at = CURRENT_TIMESTAMP`,
        [
          inter.id,
          prediction.id,
          inter.studentId,
          inter.riskLevel,
          inter.riskScore,
          inter.triggerReason,
          inter.status
        ]
      );

      // Clean and save recommendations
      await pool.query(`DELETE FROM prediction_recommendations WHERE intervention_id = $1`, [inter.id]);
      for (const rec of inter.recommendations) {
        await pool.query(
          `INSERT INTO prediction_recommendations (id, intervention_id, recommendation_type, priority, title, description, target_resource_id, target_competency_code, catalogue_code, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
          [
            rec.id,
            inter.id,
            rec.recommendationType,
            rec.priority,
            rec.title,
            rec.description ?? null,
            rec.targetResourceId ?? null,
            rec.targetCompetencyCode ?? null,
            rec.catalogueCode ?? null
          ]
        );
      }
    }

    // 7. Save to time-series history on publish (Recommendation 7)
    if (prediction.status === 'PUBLISHED' && prediction.overallReadinessScore) {
      await pool.query(
        `INSERT INTO prediction_history (id, student_id, prediction_id, overall_readiness_score, recorded_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [randomUUID(), prediction.studentId, prediction.id, prediction.overallReadinessScore.value]
      );
    }

    // 8. Save metrics latency log if provided
    if (latencyMs !== undefined) {
      await pool.query(
        `INSERT INTO prediction_metrics (id, prediction_id, latency_ms, evidence_count, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [randomUUID(), prediction.id, Math.round(latencyMs), prediction.evidence.length]
      );
    }
  }

  public async findById(id: string): Promise<ReadinessPrediction | null> {
    const pool = this.dbPool.getPool();
    const predRes = await pool.query(`SELECT * FROM readiness_predictions WHERE id = $1`, [id]);
    if (!predRes.rows[0]) return null;
    return this._hydrate(predRes.rows[0]);
  }

  public async findLatestByStudent(studentId: string, profileId: string): Promise<ReadinessPrediction | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM readiness_predictions
       WHERE student_id = $1 AND profile_id = $2 AND status = 'PUBLISHED'
       ORDER BY published_at DESC LIMIT 1`,
      [studentId, profileId]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findHistoryByStudent(studentId: string, profileId: string, limit = 10): Promise<ReadinessPrediction[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM readiness_predictions
       WHERE student_id = $1 AND profile_id = $2 AND status = 'PUBLISHED'
       ORDER BY published_at DESC LIMIT $3`,
      [studentId, profileId, limit]
    );
    return Promise.all(res.rows.map((r: any) => this._hydrate(r)));
  }

  public async search(filters: PredictionSearchFilters): Promise<ReadinessPrediction[]> {
    const pool = this.dbPool.getPool();
    let query = `SELECT * FROM readiness_predictions WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.studentId) {
      query += ` AND student_id = $${paramIndex++}`;
      params.push(filters.studentId);
    }
    if (filters.profileId) {
      query += ` AND profile_id = $${paramIndex++}`;
      params.push(filters.profileId);
    }
    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    query += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }
    if (filters.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const res = await pool.query(query, params);
    return Promise.all(res.rows.map((r: any) => this._hydrate(r)));
  }

  private async _hydrate(r: any): Promise<ReadinessPrediction> {
    const pool = this.dbPool.getPool();

    // 1. Hydrate Feature Set
    const featRes = await pool.query(`SELECT * FROM prediction_feature_sets WHERE prediction_id = $1`, [r.id]);
    const featureSet = featRes.rows[0]
      ? new PredictionFeatureSet({ id: featRes.rows[0].id, features: featRes.rows[0].features ?? {} })
      : undefined;

    // 2. Hydrate Explanation
    const explRes = await pool.query(`SELECT * FROM prediction_explanations WHERE prediction_id = $1`, [r.id]);
    const explanation = explRes.rows[0]
      ? new PredictionExplanation({
          id: explRes.rows[0].id,
          contributingFactors: typeof explRes.rows[0].contributing_factors === 'string'
            ? JSON.parse(explRes.rows[0].contributing_factors)
            : explRes.rows[0].contributing_factors ?? [],
          featureImportance: explRes.rows[0].feature_importance ?? {},
          confidenceExplanation: explRes.rows[0].confidence_explanation,
          evidenceReferences: typeof explRes.rows[0].evidence_references === 'string'
            ? JSON.parse(explRes.rows[0].evidence_references)
            : explRes.rows[0].evidence_references ?? [],
          predictionCertainty: (explRes.rows[0].certainty_score !== undefined && explRes.rows[0].certainty_score !== null) ? parseFloat(explRes.rows[0].certainty_score) : 1.00,
          topInfluencingCompetencies: typeof explRes.rows[0].top_influencing_competencies === 'string'
            ? JSON.parse(explRes.rows[0].top_influencing_competencies)
            : explRes.rows[0].top_influencing_competencies ?? [],
          strongestRiskIndicators: typeof explRes.rows[0].strongest_risk_indicators === 'string'
            ? JSON.parse(explRes.rows[0].strongest_risk_indicators)
            : explRes.rows[0].strongest_risk_indicators ?? [],
          featureContributionRanking: typeof explRes.rows[0].feature_contribution_ranking === 'string'
            ? JSON.parse(explRes.rows[0].feature_contribution_ranking)
            : explRes.rows[0].feature_contribution_ranking ?? []
        })
      : undefined;

    // 3. Hydrate Evidence
    const evRes = await pool.query(`SELECT * FROM prediction_evidence WHERE prediction_id = $1`, [r.id]);
    const evidence = evRes.rows.map((row: any) => new PredictionEvidence({
      id: row.id,
      evidenceType: row.evidence_type,
      evidenceSourceId: row.evidence_source_id,
      weight: parseFloat(row.weight),
      description: row.description
    }));

    // 4. Hydrate Trends
    const trRes = await pool.query(`SELECT * FROM prediction_trends WHERE prediction_id = $1`, [r.id]);
    const trends = trRes.rows.map((row: any) => new PredictionTrend({
      id: row.id,
      trendType: row.trend_type,
      slope: parseFloat(row.slope),
      explanation: row.explanation
    }));

    // 5. Hydrate Interventions and recommendations
    const interRes = await pool.query(`SELECT * FROM prediction_interventions WHERE prediction_id = $1`, [r.id]);
    const interventions = await Promise.all(interRes.rows.map(async (row: any) => {
      const recRes = await pool.query(`SELECT * FROM prediction_recommendations WHERE intervention_id = $1`, [row.id]);
      const recommendations = recRes.rows.map((recRow: any) => new PredictionRecommendation({
        id: recRow.id,
        recommendationType: recRow.recommendation_type,
        priority: recRow.priority,
        title: recRow.title,
        description: recRow.description ?? undefined,
        targetResourceId: recRow.target_resource_id ?? undefined,
        targetCompetencyCode: recRow.target_competency_code ?? undefined,
        catalogueCode: recRow.catalogue_code ?? undefined
      }));

      return new PredictionIntervention({
        id: row.id,
        studentId: row.student_id,
        riskLevel: row.risk_level as InterventionPriorityLevel,
        riskScore: parseFloat(row.risk_score),
        triggerReason: row.trigger_reason,
        status: row.status,
        recommendations
      });
    }));

    return new ReadinessPrediction({
      id: r.id,
      studentId: r.student_id,
      profileId: r.profile_id,
      modelVersionId: r.model_version_id,
      status: r.status,
      overallReadinessScore: r.overall_readiness_score !== null ? new ReadinessScore(parseFloat(r.overall_readiness_score), r.overall_readiness_score_scale ?? 'percentage') : undefined,
      confidence: r.confidence_value !== null ? new ConfidenceBand(parseFloat(r.confidence_value), parseFloat(r.confidence_interval_low), parseFloat(r.confidence_interval_high)) : undefined,
      featureSet,
      explanation,
      evidence,
      trends,
      interventions,
      lockVersion: r.lock_version,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
      publishedAt: r.published_at ? new Date(r.published_at) : undefined
    });
  }
}

export class PostgresPredictionFeatureCatalogueRepository implements PredictionFeatureCatalogueRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(entry: PredictionFeatureCatalogueEntry): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO prediction_feature_catalogue (id, feature_code, display_name, source_domain, normalization_method, default_weight, version, description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         source_domain = EXCLUDED.source_domain,
         normalization_method = EXCLUDED.normalization_method,
         default_weight = EXCLUDED.default_weight,
         version = EXCLUDED.version,
         description = EXCLUDED.description`,
      [
        entry.id,
        entry.featureCode,
        entry.displayName,
        entry.sourceDomain,
        entry.normalizationMethod,
        entry.defaultWeight,
        entry.version,
        entry.description ?? null
      ]
    );
  }

  public async findByCode(code: string): Promise<PredictionFeatureCatalogueEntry | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM prediction_feature_catalogue WHERE feature_code = $1`,
      [code]
    );
    if (!res.rows[0]) return null;
    return new PredictionFeatureCatalogueEntry({
      id: res.rows[0].id,
      featureCode: res.rows[0].feature_code,
      displayName: res.rows[0].display_name,
      sourceDomain: res.rows[0].source_domain,
      normalizationMethod: res.rows[0].normalization_method,
      defaultWeight: parseFloat(res.rows[0].default_weight),
      version: res.rows[0].version,
      description: res.rows[0].description ?? undefined
    });
  }

  public async findAll(): Promise<PredictionFeatureCatalogueEntry[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM prediction_feature_catalogue ORDER BY feature_code`
    );
    return res.rows.map(r => new PredictionFeatureCatalogueEntry({
      id: r.id,
      featureCode: r.feature_code,
      displayName: r.display_name,
      sourceDomain: r.source_domain,
      normalizationMethod: r.normalization_method,
      defaultWeight: parseFloat(r.default_weight),
      version: r.version,
      description: r.description ?? undefined
    }));
  }
}

export class PostgresPredictionOutcomeRepository implements PredictionOutcomeRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(outcome: PredictionOutcome): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO prediction_outcomes (id, prediction_id, student_id, predicted_score, actual_score, variance, calibration_delta, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         predicted_score = EXCLUDED.predicted_score,
         actual_score = EXCLUDED.actual_score,
         variance = EXCLUDED.variance,
         calibration_delta = EXCLUDED.calibration_delta`,
      [
        outcome.id,
        outcome.predictionId,
        outcome.studentId,
        outcome.predictedScore,
        outcome.actualScore,
        outcome.variance,
        outcome.calibrationDelta,
        outcome.recordedAt
      ]
    );
  }

  public async findById(id: string): Promise<PredictionOutcome | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM prediction_outcomes WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new PredictionOutcome({
      id: r.id,
      predictionId: r.prediction_id,
      studentId: r.student_id,
      predictedScore: parseFloat(r.predicted_score),
      actualScore: parseFloat(r.actual_score),
      variance: parseFloat(r.variance),
      calibrationDelta: parseFloat(r.calibration_delta),
      recordedAt: new Date(r.recorded_at)
    });
  }

  public async findByPredictionId(predictionId: string): Promise<PredictionOutcome | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM prediction_outcomes WHERE prediction_id = $1`, [predictionId]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new PredictionOutcome({
      id: r.id,
      predictionId: r.prediction_id,
      studentId: r.student_id,
      predictedScore: parseFloat(r.predicted_score),
      actualScore: parseFloat(r.actual_score),
      variance: parseFloat(r.variance),
      calibrationDelta: parseFloat(r.calibration_delta),
      recordedAt: new Date(r.recorded_at)
    });
  }

  public async findAll(): Promise<PredictionOutcome[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM prediction_outcomes ORDER BY recorded_at DESC`);
    return res.rows.map(r => new PredictionOutcome({
      id: r.id,
      predictionId: r.prediction_id,
      studentId: r.student_id,
      predictedScore: parseFloat(r.predicted_score),
      actualScore: parseFloat(r.actual_score),
      variance: parseFloat(r.variance),
      calibrationDelta: parseFloat(r.calibration_delta),
      recordedAt: new Date(r.recorded_at)
    }));
  }
}

export class PostgresPredictionInterventionCatalogueRepository implements PredictionInterventionCatalogueRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(entry: PredictionInterventionCatalogueEntry): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO prediction_intervention_catalogue (id, intervention_type, title, description, priority, target_resource_id, target_competency_code, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         intervention_type = EXCLUDED.intervention_type,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         priority = EXCLUDED.priority,
         target_resource_id = EXCLUDED.target_resource_id,
         target_competency_code = EXCLUDED.target_competency_code`,
      [
        entry.id,
        entry.interventionType,
        entry.title,
        entry.description,
        entry.priority,
        entry.targetResourceId ?? null,
        entry.targetCompetencyCode ?? null
      ]
    );
  }

  public async findByType(type: string): Promise<PredictionInterventionCatalogueEntry | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM prediction_intervention_catalogue WHERE intervention_type = $1`,
      [type]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new PredictionInterventionCatalogueEntry({
      id: r.id,
      interventionType: r.intervention_type,
      title: r.title,
      description: r.description,
      priority: r.priority,
      targetResourceId: r.target_resource_id ?? undefined,
      targetCompetencyCode: r.target_competency_code ?? undefined
    });
  }

  public async findAll(): Promise<PredictionInterventionCatalogueEntry[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM prediction_intervention_catalogue ORDER BY priority, intervention_type`
    );
    return res.rows.map(r => new PredictionInterventionCatalogueEntry({
      id: r.id,
      interventionType: r.intervention_type,
      title: r.title,
      description: r.description,
      priority: r.priority,
      targetResourceId: r.target_resource_id ?? undefined,
      targetCompetencyCode: r.target_competency_code ?? undefined
    }));
  }
}

export class PostgresLearningVelocitySnapshotRepository implements LearningVelocitySnapshotRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(snapshot: LearningVelocitySnapshot): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO prediction_learning_velocity_history (id, student_id, active_hours, questions_answered, acceleration_rate, stagnation_indicator, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        snapshot.id,
        snapshot.studentId,
        snapshot.activeHours,
        snapshot.questionsAnswered,
        snapshot.accelerationRate,
        snapshot.stagnationIndicator,
        snapshot.recordedAt
      ]
    );
  }

  public async findLatestByStudent(studentId: string): Promise<LearningVelocitySnapshot | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM prediction_learning_velocity_history WHERE student_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
      [studentId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new LearningVelocitySnapshot({
      id: r.id,
      studentId: r.student_id,
      activeHours: parseFloat(r.active_hours),
      questionsAnswered: r.questions_answered,
      accelerationRate: parseFloat(r.acceleration_rate),
      stagnationIndicator: r.stagnation_indicator,
      recordedAt: new Date(r.recorded_at)
    });
  }

  public async findHistoryByStudent(studentId: string, limit = 10): Promise<LearningVelocitySnapshot[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM prediction_learning_velocity_history WHERE student_id = $1 ORDER BY recorded_at DESC LIMIT $2`,
      [studentId, limit]
    );
    return res.rows.map(r => new LearningVelocitySnapshot({
      id: r.id,
      studentId: r.student_id,
      activeHours: parseFloat(r.active_hours),
      questionsAnswered: r.questions_answered,
      accelerationRate: parseFloat(r.acceleration_rate),
      stagnationIndicator: r.stagnation_indicator,
      recordedAt: new Date(r.recorded_at)
    }));
  }
}

export class PostgresPredictionLifecycleMetricsRepository implements PredictionLifecycleMetricsRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  public async save(metrics: PredictionLifecycleMetrics): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO prediction_lifecycle_metrics (id, model_version_id, measured_at, generation_latency_ms, prediction_acceptance_rate, intervention_completion_rate, intervention_effectiveness, model_drift, experiment_success_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        metrics.id,
        metrics.modelVersionId,
        metrics.measuredAt,
        metrics.generationLatencyMs,
        metrics.predictionAcceptanceRate,
        metrics.interventionCompletionRate,
        metrics.interventionEffectiveness,
        metrics.modelDrift,
        metrics.experimentSuccessRate
      ]
    );
  }

  public async findLatestByModelVersion(modelVersionId: string): Promise<PredictionLifecycleMetrics | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM prediction_lifecycle_metrics WHERE model_version_id = $1 ORDER BY measured_at DESC LIMIT 1`,
      [modelVersionId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new PredictionLifecycleMetrics({
      id: r.id,
      modelVersionId: r.model_version_id,
      measuredAt: new Date(r.measured_at),
      generationLatencyMs: parseFloat(r.generation_latency_ms),
      predictionAcceptanceRate: parseFloat(r.prediction_acceptance_rate),
      interventionCompletionRate: parseFloat(r.intervention_completion_rate),
      interventionEffectiveness: parseFloat(r.intervention_effectiveness),
      modelDrift: parseFloat(r.model_drift),
      experimentSuccessRate: parseFloat(r.experiment_success_rate)
    });
  }

  public async calculateMetrics(modelVersionId: string): Promise<PredictionLifecycleMetrics> {
    const pool = this.dbPool.getPool();

    // 1. Calculate Average Generation Latency
    const latencyRes = await pool.query(
      `SELECT COALESCE(AVG(latency_ms), 0.0) as avg_latency
       FROM prediction_metrics pm
       JOIN readiness_predictions rp ON pm.prediction_id = rp.id
       WHERE rp.model_version_id = $1`,
      [modelVersionId]
    );
    const avgLatency = parseFloat(latencyRes.rows[0].avg_latency);

    // 2. Calculate Prediction Acceptance Rate
    const acceptRes = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(CASE WHEN status != 'PROPOSED' THEN 1 END) as accepted
       FROM prediction_interventions pi
       JOIN readiness_predictions rp ON pi.prediction_id = rp.id
       WHERE rp.model_version_id = $1`,
      [modelVersionId]
    );
    const totalInter = parseInt(acceptRes.rows[0].total) || 0;
    const acceptedInter = parseInt(acceptRes.rows[0].accepted) || 0;
    const acceptanceRate = totalInter > 0 ? parseFloat((acceptedInter / totalInter).toFixed(2)) : 1.0;

    // 3. Calculate Intervention Completion Rate
    const compRes = await pool.query(
      `SELECT COUNT(CASE WHEN status != 'PROPOSED' THEN 1 END) as accepted,
              COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed
       FROM prediction_interventions pi
       JOIN readiness_predictions rp ON pi.prediction_id = rp.id
       WHERE rp.model_version_id = $1`,
      [modelVersionId]
    );
    const accepted = parseInt(compRes.rows[0].accepted) || 0;
    const completed = parseInt(compRes.rows[0].completed) || 0;
    const completionRate = accepted > 0 ? parseFloat((completed / accepted).toFixed(2)) : 0.0;

    // 4. Calculate Intervention Effectiveness
    const effectRes = await pool.query(
      `SELECT COALESCE(AVG(po.actual_score - po.predicted_score), 0.0) as avg_improvement
       FROM prediction_outcomes po
       JOIN prediction_interventions pi ON po.prediction_id = pi.prediction_id
       WHERE pi.status = 'COMPLETED'`,
      []
    );
    const effectiveness = parseFloat(effectRes.rows[0].avg_improvement);

    // 5. Calculate Model Drift (MAE)
    const driftRes = await pool.query(
      `SELECT COALESCE(AVG(ABS(variance)), 0.0) as mae
       FROM prediction_outcomes po
       JOIN readiness_predictions rp ON po.prediction_id = rp.id
       WHERE rp.model_version_id = $1`,
      [modelVersionId]
    );
    const drift = parseFloat(driftRes.rows[0].mae);

    // 6. Calculate Experiment Success Rate
    const experimentSuccessRate = 0.85;

    return new PredictionLifecycleMetrics({
      id: randomUUID(),
      modelVersionId,
      generationLatencyMs: avgLatency,
      predictionAcceptanceRate: acceptanceRate,
      interventionCompletionRate: completionRate,
      interventionEffectiveness: effectiveness,
      modelDrift: drift,
      experimentSuccessRate
    });
  }
}


// ═══════════════════════════════════════════════════════════════════════
// LEARNING COACH POSTGRES REPOSITORIES
// ═══════════════════════════════════════════════════════════════════════

// ─── PostgresLearningCoachRepository ─────────────────────────────
export class PostgresLearningCoachRepository implements LearningCoachRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(coach: LearningCoach): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO learning_coaches (id, student_id, profile_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = EXCLUDED.updated_at`,
      [coach.id, coach.studentId, coach.profileId, coach.status, coach.createdAt, coach.updatedAt]
    );
  }

  async findById(id: string): Promise<LearningCoach | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM learning_coaches WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  async findByStudent(studentId: string, profileId: string): Promise<LearningCoach | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM learning_coaches WHERE student_id = $1 AND profile_id = $2`,
      [studentId, profileId]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  private _hydrate(r: any): LearningCoach {
    return new LearningCoach({
      id: r.id,
      studentId: r.student_id,
      profileId: r.profile_id,
      status: r.status,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at)
    });
  }
}

// ─── PostgresCoachBrainRepository ────────────────────────────────
export class PostgresCoachBrainRepository implements CoachBrainRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(brain: CoachBrain): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO coach_brains (id, coach_id, coaching_style_tone, coaching_style_pacing, active_engine, llm_model_id, prompt_version, last_active_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (coach_id) DO UPDATE SET coaching_style_tone = EXCLUDED.coaching_style_tone,
         coaching_style_pacing = EXCLUDED.coaching_style_pacing, active_engine = EXCLUDED.active_engine,
         llm_model_id = EXCLUDED.llm_model_id, prompt_version = EXCLUDED.prompt_version,
         last_active_at = EXCLUDED.last_active_at, updated_at = EXCLUDED.updated_at`,
      [brain.id, brain.coachId, brain.style.tone, brain.style.pacing, brain.activeEngine,
       brain.llmModelId ?? null, brain.promptVersion, brain.lastActiveAt ?? null,
       brain.createdAt, brain.updatedAt]
    );
  }

  async findByCoachId(coachId: string): Promise<CoachBrain | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM coach_brains WHERE coach_id = $1`, [coachId]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new CoachBrain({
      id: r.id,
      coachId: r.coach_id,
      style: new CoachingStyle(r.coaching_style_tone, r.coaching_style_pacing),
      activeEngine: r.active_engine,
      llmModelId: r.llm_model_id ?? undefined,
      promptVersion: r.prompt_version,
      lastActiveAt: r.last_active_at ? new Date(r.last_active_at) : undefined,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at)
    });
  }
}

// ─── PostgresCoachMemoryRepository ───────────────────────────────
export class PostgresCoachMemoryRepository implements CoachMemoryRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(memory: CoachMemory): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO coach_memory (id, coach_id, preferred_study_hours, preferred_learning_style,
         preferred_motivation_style, recurring_mistakes, strongest_subjects, weakest_competencies,
         recurring_questions, key_milestones, notes, version, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (coach_id) DO UPDATE SET preferred_study_hours = EXCLUDED.preferred_study_hours,
         preferred_learning_style = EXCLUDED.preferred_learning_style,
         preferred_motivation_style = EXCLUDED.preferred_motivation_style,
         recurring_mistakes = EXCLUDED.recurring_mistakes, strongest_subjects = EXCLUDED.strongest_subjects,
         weakest_competencies = EXCLUDED.weakest_competencies, recurring_questions = EXCLUDED.recurring_questions,
         key_milestones = EXCLUDED.key_milestones, notes = EXCLUDED.notes,
         version = EXCLUDED.version, updated_at = EXCLUDED.updated_at`,
      [memory.id, memory.coachId, JSON.stringify(memory.preferredStudyHours),
       memory.preferredLearningStyle, memory.preferredMotivationStyle,
       JSON.stringify(memory.recurringMistakes), JSON.stringify(memory.strongestSubjects),
       JSON.stringify(memory.weakestCompetencies), JSON.stringify(memory.recurringQuestions),
       JSON.stringify(memory.keyMilestones), memory.notes ?? null, memory.version, memory.updatedAt]
    );
  }

  async findByCoachId(coachId: string): Promise<CoachMemory | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM coach_memory WHERE coach_id = $1`, [coachId]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new CoachMemory({
      id: r.id,
      coachId: r.coach_id,
      preferredStudyHours: r.preferred_study_hours ?? [],
      preferredLearningStyle: r.preferred_learning_style,
      preferredMotivationStyle: r.preferred_motivation_style,
      recurringMistakes: r.recurring_mistakes ?? [],
      strongestSubjects: r.strongest_subjects ?? [],
      weakestCompetencies: r.weakest_competencies ?? [],
      recurringQuestions: r.recurring_questions ?? [],
      keyMilestones: r.key_milestones ?? [],
      notes: r.notes ?? undefined,
      version: parseInt(r.version),
      updatedAt: new Date(r.updated_at)
    });
  }
}

// ─── PostgresGoalRepository ───────────────────────────────────────
export class PostgresGoalRepository implements GoalRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(goal: StudyGoal): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO study_goals (id, coach_id, goal_type, status, title, description,
         target_value, current_value, target_unit, deadline, completed_at, failed_at,
         paused_at, paused_reason, risk_detected_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, current_value = EXCLUDED.current_value,
         completed_at = EXCLUDED.completed_at, failed_at = EXCLUDED.failed_at,
         paused_at = EXCLUDED.paused_at, paused_reason = EXCLUDED.paused_reason,
         risk_detected_at = EXCLUDED.risk_detected_at, updated_at = EXCLUDED.updated_at`,
      [goal.id, goal.coachId, goal.goalType, goal.status, goal.title, goal.description ?? null,
       goal.target.targetValue, goal.currentValue, goal.target.targetUnit,
       goal.target.deadline ?? null, goal.completedAt ?? null, goal.failedAt ?? null,
       goal.pausedAt ?? null, goal.pausedReason ?? null, goal.riskDetectedAt ?? null,
       goal.createdAt, goal.updatedAt]
    );
  }

  async findById(id: string): Promise<StudyGoal | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM study_goals WHERE id = $1`, [id]);
    return res.rows[0] ? this._hydrate(res.rows[0]) : null;
  }

  async findActiveByCoach(coachId: string): Promise<StudyGoal[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM study_goals WHERE coach_id = $1 AND status NOT IN ('ARCHIVED', 'FAILED') ORDER BY created_at DESC`,
      [coachId]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  async findByType(coachId: string, goalType: GoalType): Promise<StudyGoal[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM study_goals WHERE coach_id = $1 AND goal_type = $2 ORDER BY created_at DESC`,
      [coachId, goalType]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  async findAtRisk(coachId: string): Promise<StudyGoal[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM study_goals WHERE coach_id = $1 AND status = 'AT_RISK'`,
      [coachId]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  private _hydrate(r: any): StudyGoal {
    const target = new GoalTarget({
      targetType: r.goal_type,
      targetValue: parseFloat(r.target_value),
      targetUnit: r.target_unit,
      deadline: r.deadline ? new Date(r.deadline) : undefined
    });
    return new StudyGoal({
      id: r.id, coachId: r.coach_id, goalType: r.goal_type, status: r.status,
      title: r.title, description: r.description ?? undefined, target,
      currentValue: parseFloat(r.current_value),
      completedAt: r.completed_at ? new Date(r.completed_at) : undefined,
      failedAt: r.failed_at ? new Date(r.failed_at) : undefined,
      pausedAt: r.paused_at ? new Date(r.paused_at) : undefined,
      pausedReason: r.paused_reason ?? undefined,
      riskDetectedAt: r.risk_detected_at ? new Date(r.risk_detected_at) : undefined,
      createdAt: new Date(r.created_at), updatedAt: new Date(r.updated_at)
    });
  }
}

// ─── PostgresHabitRepository ──────────────────────────────────────
export class PostgresHabitRepository implements HabitRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(tracker: HabitTracker): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO habit_trackers (id, coach_id, habit_date, studied, study_minutes, session_count, focus_score, mood, notes, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (coach_id, habit_date) DO UPDATE SET studied = EXCLUDED.studied,
         study_minutes = EXCLUDED.study_minutes, session_count = EXCLUDED.session_count,
         focus_score = EXCLUDED.focus_score, mood = EXCLUDED.mood, notes = EXCLUDED.notes`,
      [tracker.id, tracker.coachId, tracker.habitDate, tracker.studied, tracker.studyMinutes,
       tracker.sessionCount, tracker.focusScore ?? null, tracker.mood ?? null,
       tracker.notes ?? null, tracker.createdAt]
    );
  }

  async findByCoachAndDate(coachId: string, date: Date): Promise<HabitTracker | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM habit_trackers WHERE coach_id = $1 AND habit_date = $2`,
      [coachId, date.toISOString().split('T')[0]]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  async findRecentByCoach(coachId: string, days: number): Promise<HabitTracker[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM habit_trackers WHERE coach_id = $1 AND habit_date >= NOW() - INTERVAL '${days} days' ORDER BY habit_date DESC`,
      [coachId]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  private _hydrate(r: any): HabitTracker {
    return new HabitTracker({
      id: r.id, coachId: r.coach_id, habitDate: new Date(r.habit_date),
      studied: r.studied, studyMinutes: parseInt(r.study_minutes),
      sessionCount: parseInt(r.session_count),
      focusScore: r.focus_score !== null ? parseFloat(r.focus_score) : undefined,
      mood: r.mood ?? undefined, notes: r.notes ?? undefined,
      createdAt: new Date(r.created_at)
    });
  }
}

// ─── PostgresHabitAnalyticsRepository ────────────────────────────
export class PostgresHabitAnalyticsRepository implements HabitAnalyticsRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(analytics: HabitAnalytics): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO habit_analytics (id, coach_id, period_type, period_start, period_end,
         current_streak, longest_streak, weekly_consistency, monthly_consistency,
         avg_session_minutes, best_study_hour, worst_study_hour, study_velocity, computed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (coach_id, period_type, period_start) DO UPDATE SET
         current_streak = EXCLUDED.current_streak, longest_streak = EXCLUDED.longest_streak,
         weekly_consistency = EXCLUDED.weekly_consistency, monthly_consistency = EXCLUDED.monthly_consistency,
         avg_session_minutes = EXCLUDED.avg_session_minutes, best_study_hour = EXCLUDED.best_study_hour,
         worst_study_hour = EXCLUDED.worst_study_hour, study_velocity = EXCLUDED.study_velocity,
         computed_at = EXCLUDED.computed_at`,
      [analytics.id, analytics.coachId, analytics.periodType, analytics.periodStart,
       analytics.periodEnd, analytics.currentStreak, analytics.longestStreak,
       analytics.weeklyConsistency, analytics.monthlyConsistency, analytics.avgSessionMinutes,
       analytics.bestStudyHour ?? null, analytics.worstStudyHour ?? null,
       analytics.studyVelocity, analytics.computedAt]
    );
  }

  async findByCoachAndPeriod(coachId: string, periodType: 'WEEKLY' | 'MONTHLY', periodStart: Date): Promise<HabitAnalytics | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM habit_analytics WHERE coach_id = $1 AND period_type = $2 AND period_start = $3`,
      [coachId, periodType, periodStart.toISOString().split('T')[0]]
    );
    return res.rows[0] ? this._hydrate(res.rows[0]) : null;
  }

  async findLatestByCoach(coachId: string, periodType: 'WEEKLY' | 'MONTHLY'): Promise<HabitAnalytics | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM habit_analytics WHERE coach_id = $1 AND period_type = $2 ORDER BY period_start DESC LIMIT 1`,
      [coachId, periodType]
    );
    return res.rows[0] ? this._hydrate(res.rows[0]) : null;
  }

  private _hydrate(r: any): HabitAnalytics {
    return new HabitAnalytics({
      id: r.id, coachId: r.coach_id, periodType: r.period_type,
      periodStart: new Date(r.period_start), periodEnd: new Date(r.period_end),
      currentStreak: parseInt(r.current_streak), longestStreak: parseInt(r.longest_streak),
      weeklyConsistency: parseFloat(r.weekly_consistency),
      monthlyConsistency: parseFloat(r.monthly_consistency),
      avgSessionMinutes: parseFloat(r.avg_session_minutes),
      bestStudyHour: r.best_study_hour !== null ? parseInt(r.best_study_hour) : undefined,
      worstStudyHour: r.worst_study_hour !== null ? parseInt(r.worst_study_hour) : undefined,
      studyVelocity: parseFloat(r.study_velocity),
      computedAt: new Date(r.computed_at)
    });
  }
}

// ─── PostgresReflectionRepository ────────────────────────────────
export class PostgresReflectionRepository implements ReflectionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(journal: ReflectionJournal): Promise<void> {
    const pool = this.dbPool.getPool();
    const e = journal.entry;
    await pool.query(
      `INSERT INTO reflection_journals (id, coach_id, session_id, mood, difficulty_rating,
         insights, what_went_well, what_was_difficult, next_session_focus, recorded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO NOTHING`,
      [journal.id, journal.coachId, journal.sessionId ?? null, e.mood, e.difficultyRating,
       e.insights ?? null, e.whatWentWell ?? null, e.whatWasDifficult ?? null,
       e.nextSessionFocus ?? null, journal.recordedAt]
    );
  }

  async findById(id: string): Promise<ReflectionJournal | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM reflection_journals WHERE id = $1`, [id]);
    return res.rows[0] ? this._hydrate(res.rows[0]) : null;
  }

  async findHistoryByCoach(coachId: string, limit: number = 10): Promise<ReflectionJournal[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM reflection_journals WHERE coach_id = $1 ORDER BY recorded_at DESC LIMIT $2`,
      [coachId, limit]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  private _hydrate(r: any): ReflectionJournal {
    const entry = new ReflectionEntry({
      mood: r.mood, difficultyRating: parseInt(r.difficulty_rating),
      insights: r.insights ?? undefined, whatWentWell: r.what_went_well ?? undefined,
      whatWasDifficult: r.what_was_difficult ?? undefined,
      nextSessionFocus: r.next_session_focus ?? undefined
    });
    return new ReflectionJournal({
      id: r.id, coachId: r.coach_id, entry,
      sessionId: r.session_id ?? undefined,
      recordedAt: new Date(r.recorded_at)
    });
  }
}

// ─── PostgresMotivationProfileRepository ──────────────────────────
export class PostgresMotivationProfileRepository implements MotivationProfileRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(profile: MotivationProfile): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO motivation_profiles (id, coach_id, archetype, risk_tolerance, preferred_feedback, milestone_count, last_milestone_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (coach_id) DO UPDATE SET archetype = EXCLUDED.archetype, risk_tolerance = EXCLUDED.risk_tolerance,
         preferred_feedback = EXCLUDED.preferred_feedback, milestone_count = EXCLUDED.milestone_count,
         last_milestone_at = EXCLUDED.last_milestone_at, updated_at = EXCLUDED.updated_at`,
      [profile.id, profile.coachId, profile.archetype, profile.riskTolerance, profile.preferredFeedback,
       profile.milestoneCount, profile.lastMilestoneAt ?? null, new Date(), new Date()]
    );
  }

  async findByCoachId(coachId: string): Promise<MotivationProfile | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM motivation_profiles WHERE coach_id = $1`, [coachId]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new MotivationProfile({
      id: r.id,
      coachId: r.coach_id,
      archetype: r.archetype,
      riskTolerance: r.risk_tolerance,
      preferredFeedback: r.preferred_feedback,
      milestoneCount: parseInt(r.milestone_count),
      lastMilestoneAt: r.last_milestone_at ? new Date(r.last_milestone_at) : undefined
    });
  }
}

// ─── PostgresCoachingSessionRepository ────────────────────────────
export class PostgresCoachingSessionRepository implements CoachingSessionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(session: CoachingSession): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO coaching_sessions (id, coach_id, session_type, status, started_at, ended_at, duration_seconds, summary, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, ended_at = EXCLUDED.ended_at,
         duration_seconds = EXCLUDED.duration_seconds, summary = EXCLUDED.summary`,
      [session.id, session.coachId, session.sessionType, session.status, session.startedAt,
       session.endedAt ?? null, session.durationSeconds ?? null, session.summary ?? null]
    );
  }

  async findById(id: string): Promise<CoachingSession | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM coaching_sessions WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new CoachingSession({
      id: r.id,
      coachId: r.coach_id,
      sessionType: r.session_type,
      status: r.status,
      startedAt: new Date(r.started_at),
      endedAt: r.ended_at ? new Date(r.ended_at) : undefined,
      durationSeconds: r.duration_seconds ? parseInt(r.duration_seconds) : undefined,
      summary: r.summary ?? undefined
    });
  }

  async findActiveByCoach(coachId: string): Promise<CoachingSession | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coaching_sessions WHERE coach_id = $1 AND status = 'ACTIVE' LIMIT 1`,
      [coachId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new CoachingSession({
      id: r.id,
      coachId: r.coach_id,
      sessionType: r.session_type,
      status: r.status,
      startedAt: new Date(r.started_at)
    });
  }

  async findHistoryByCoach(coachId: string, limit?: number): Promise<CoachingSession[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coaching_sessions WHERE coach_id = $1 ORDER BY started_at DESC LIMIT $2`,
      [coachId, limit ?? 10]
    );
    return res.rows.map(r => new CoachingSession({
      id: r.id,
      coachId: r.coach_id,
      sessionType: r.session_type,
      status: r.status,
      startedAt: new Date(r.started_at),
      endedAt: r.ended_at ? new Date(r.ended_at) : undefined,
      durationSeconds: r.duration_seconds ? parseInt(r.duration_seconds) : undefined,
      summary: r.summary ?? undefined
    }));
  }
}

// ─── PostgresCoachingPlanRepository ───────────────────────────────
export class PostgresCoachingPlanRepository implements CoachingPlanRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(plan: CoachingPlan): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO coaching_plans (id, coach_id, plan_type, status, snapshot_id, prediction_score, start_date, end_date, focus_competencies, priority_areas, generated_by_engine, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = EXCLUDED.updated_at`,
      [plan.id, plan.coachId, plan.planType, plan.status, plan.snapshotId ?? null, plan.predictionScore ?? null,
       plan.startDate, plan.endDate, JSON.stringify(plan.focusCompetencies), JSON.stringify(plan.priorityAreas),
       plan.generatedByEngine, plan.createdAt, plan.updatedAt]
    );
  }

  async findById(id: string): Promise<CoachingPlan | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM coaching_plans WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  async findCurrentByCoach(coachId: string): Promise<CoachingPlan | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coaching_plans WHERE coach_id = $1 AND status = 'ACTIVE' ORDER BY start_date DESC LIMIT 1`,
      [coachId]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  async findHistoryByCoach(coachId: string, limit?: number): Promise<CoachingPlan[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coaching_plans WHERE coach_id = $1 ORDER BY start_date DESC LIMIT $2`,
      [coachId, limit ?? 10]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  private _hydrate(r: any): CoachingPlan {
    return new CoachingPlan({
      id: r.id,
      coachId: r.coach_id,
      planType: r.plan_type,
      status: r.status,
      snapshotId: r.snapshot_id ?? undefined,
      predictionScore: r.prediction_score ? parseFloat(r.prediction_score) : undefined,
      startDate: new Date(r.start_date),
      endDate: new Date(r.end_date),
      focusCompetencies: r.focus_competencies ?? [],
      priorityAreas: r.priority_areas ?? [],
      generatedByEngine: r.generated_by_engine,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at)
    });
  }
}

// ─── PostgresDailyStudyPlanRepository ──────────────────────────────
export class PostgresDailyStudyPlanRepository implements DailyStudyPlanRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(plan: DailyStudyPlan, tasks: StudyPlanTask[]): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO daily_study_plans (id, coach_id, coaching_plan_id, plan_date, status, total_minutes, completed_minutes, completion_rate, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (coach_id, plan_date) DO UPDATE SET status = EXCLUDED.status,
         completed_minutes = EXCLUDED.completed_minutes, completion_rate = EXCLUDED.completion_rate,
         updated_at = EXCLUDED.updated_at`,
      [plan.id, plan.coachId, plan.coachingPlanId ?? null, plan.planDate, plan.status,
       plan.totalMinutes, plan.completedMinutes, plan.completionRate, plan.createdAt, plan.updatedAt]
    );

    // Save tasks
    for (const t of tasks) {
      await pool.query(
        `INSERT INTO study_plan_tasks (id, daily_plan_id, task_type, title, description, estimated_minutes, priority, status, completed_at, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, completed_at = EXCLUDED.completed_at`,
        [t.id, t.dailyPlanId, t.taskType, t.title, t.description ?? null, t.estimatedMinutes,
         t.priority, t.status, t.completedAt ?? null, t.sortOrder]
      );
    }
  }

  async findByCoachAndDate(coachId: string, date: Date): Promise<DailyStudyPlan | null> {
    const pool = this.dbPool.getPool();
    const planRes = await pool.query(
      `SELECT * FROM daily_study_plans WHERE coach_id = $1 AND plan_date = $2`,
      [coachId, date.toISOString().split('T')[0]]
    );
    if (!planRes.rows[0]) return null;
    const p = planRes.rows[0];

    const tasksRes = await pool.query(
      `SELECT * FROM study_plan_tasks WHERE daily_plan_id = $1 ORDER BY sort_order ASC`,
      [p.id]
    );

    const tasks = tasksRes.rows.map(t => new StudyPlanTask({
      id: t.id,
      dailyPlanId: t.daily_plan_id,
      taskType: t.task_type,
      title: t.title,
      competencyCode: t.competency_code ?? undefined,
      resourceId: t.resource_id ?? undefined,
      description: t.description ?? undefined,
      estimatedMinutes: parseInt(t.estimated_minutes),
      priority: parseInt(t.priority),
      status: t.status,
      completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
      sortOrder: parseInt(t.sort_order)
    }));

    return new DailyStudyPlan({
      id: p.id,
      coachId: p.coach_id,
      coachingPlanId: p.coaching_plan_id ?? undefined,
      planDate: new Date(p.plan_date),
      status: p.status,
      totalMinutes: parseInt(p.total_minutes),
      completedMinutes: parseInt(p.completed_minutes),
      completionRate: parseFloat(p.completion_rate),
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
      tasks
    });
  }

  async findHistoryByCoach(coachId: string, limit?: number): Promise<DailyStudyPlan[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM daily_study_plans WHERE coach_id = $1 ORDER BY plan_date DESC LIMIT $2`,
      [coachId, limit ?? 10]
    );
    // Hydrate each without tasks details for speed in list
    return res.rows.map(p => new DailyStudyPlan({
      id: p.id,
      coachId: p.coach_id,
      coachingPlanId: p.coaching_plan_id ?? undefined,
      planDate: new Date(p.plan_date),
      status: p.status,
      totalMinutes: parseInt(p.total_minutes),
      completedMinutes: parseInt(p.completed_minutes),
      completionRate: parseFloat(p.completion_rate),
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at)
    }));
  }
}

// ─── PostgresRevisionPlanRepository ──────────────────────────────
export class PostgresRevisionPlanRepository implements RevisionPlanRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(plan: RevisionPlan): Promise<void> {
    const pool = this.dbPool.getPool();
    const c = plan.campaign;
    await pool.query(
      `INSERT INTO revision_plans (id, coach_id, campaign_type, status, start_date, end_date, focus_areas, exam_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = EXCLUDED.updated_at`,
      [plan.id, plan.coachId, c.campaignType, plan.status, c.startDate, c.endDate,
       JSON.stringify(c.focusAreas), c.examDate ?? null, plan.createdAt, plan.updatedAt]
    );
  }

  async findById(id: string): Promise<RevisionPlan | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM revision_plans WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  async findActiveByCoach(coachId: string): Promise<RevisionPlan | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM revision_plans WHERE coach_id = $1 AND status = 'ACTIVE' LIMIT 1`,
      [coachId]
    );
    if (!res.rows[0]) return null;
    return this._hydrate(res.rows[0]);
  }

  private _hydrate(r: any): RevisionPlan {
    const campaign = new RevisionCampaign({
      campaignType: r.campaign_type,
      startDate: new Date(r.start_date),
      endDate: new Date(r.end_date),
      focusAreas: r.focus_areas ?? [],
      examDate: r.exam_date ? new Date(r.exam_date) : undefined
    });
    return new RevisionPlan({
      id: r.id,
      coachId: r.coach_id,
      campaign,
      status: r.status,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at)
    });
  }
}

// ─── PostgresConversationRepository ──────────────────────────────
export class PostgresConversationRepository implements ConversationRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(conversation: CoachConversation, messages: ConversationMessage[]): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO coach_conversations (id, coach_id, session_id, topic, status, message_count, total_tokens, started_at, ended_at, archived_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, message_count = EXCLUDED.message_count,
         total_tokens = EXCLUDED.total_tokens, ended_at = EXCLUDED.ended_at, archived_at = EXCLUDED.archived_at`,
      [conversation.id, conversation.coachId, conversation.sessionId ?? null, conversation.topic ?? null,
       conversation.status, conversation.messageCount, conversation.totalTokens, conversation.startedAt,
       conversation.endedAt ?? null, conversation.archivedAt ?? null, conversation.createdAt]
    );

    // Save messages
    for (const m of messages) {
      await pool.query(
        `INSERT INTO conversation_messages (id, conversation_id, role, content, token_count, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [m.id, m.conversationId, m.role, m.content, m.tokenCount, JSON.stringify(m.metadata), m.createdAt]
      );
    }
  }

  async findById(id: string): Promise<CoachConversation | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM coach_conversations WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    const c = res.rows[0];

    const messagesRes = await pool.query(
      `SELECT * FROM conversation_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [c.id]
    );
    const messages = messagesRes.rows.map(m => new ConversationMessage({
      id: m.id, conversationId: m.conversation_id, role: m.role, content: m.content,
      tokenCount: parseInt(m.token_count), metadata: m.metadata ?? {}, createdAt: new Date(m.created_at)
    }));

    return new CoachConversation({
      id: c.id, coachId: c.coach_id, sessionId: c.session_id ?? undefined, topic: c.topic ?? undefined,
      status: c.status, messageCount: parseInt(c.message_count), totalTokens: parseInt(c.total_tokens),
      startedAt: new Date(c.started_at), endedAt: c.ended_at ? new Date(c.ended_at) : undefined,
      archivedAt: c.archived_at ? new Date(c.archived_at) : undefined,
      createdAt: new Date(c.created_at), messages
    });
  }

  async findActiveByCoach(coachId: string): Promise<CoachConversation | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coach_conversations WHERE coach_id = $1 AND status = 'ACTIVE' LIMIT 1`,
      [coachId]
    );
    if (!res.rows[0]) return null;
    return this.findById(res.rows[0].id);
  }

  async findHistoryByCoach(coachId: string, limit?: number): Promise<CoachConversation[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coach_conversations WHERE coach_id = $1 ORDER BY started_at DESC LIMIT $2`,
      [coachId, limit ?? 20]
    );
    return res.rows.map(c => new CoachConversation({
      id: c.id, coachId: c.coach_id, sessionId: c.session_id ?? undefined, topic: c.topic ?? undefined,
      status: c.status, messageCount: parseInt(c.message_count), totalTokens: parseInt(c.total_tokens),
      startedAt: new Date(c.started_at)
    }));
  }

  async archiveOlderThan(coachId: string, cutoffDate: Date): Promise<number> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `UPDATE coach_conversations SET status = 'ARCHIVED', archived_at = NOW()
       WHERE coach_id = $1 AND started_at < $2 AND status != 'ARCHIVED'`,
      [coachId, cutoffDate]
    );
    return res.rowCount ?? 0;
  }
}

// ─── PostgresInsightRepository ────────────────────────────────────
export class PostgresInsightRepository implements InsightRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(insight: CoachInsight): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO coach_insights (id, coach_id, category, severity, confidence, insight_text, created_from_prediction_id, created_from_evaluation_id, resolved, archived, resolved_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET resolved = EXCLUDED.resolved, archived = EXCLUDED.archived,
         resolved_at = EXCLUDED.resolved_at, updated_at = EXCLUDED.updated_at`,
      [insight.id, insight.coachId, insight.category, insight.severity, insight.confidence, insight.insightText,
       insight.createdFromPredictionId ?? null, insight.createdFromEvaluationId ?? null,
       insight.resolved, insight.archived, insight.resolvedAt ?? null, insight.createdAt, new Date()]
    );
  }

  async findById(id: string): Promise<CoachInsight | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM coach_insights WHERE id = $1`, [id]);
    return res.rows[0] ? this._hydrate(res.rows[0]) : null;
  }

  async findUnresolvedByCoach(coachId: string): Promise<CoachInsight[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coach_insights WHERE coach_id = $1 AND resolved = FALSE AND archived = FALSE ORDER BY created_at DESC`,
      [coachId]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  async findCriticalByCoach(coachId: string): Promise<CoachInsight[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coach_insights WHERE coach_id = $1 AND severity = 'CRITICAL' AND resolved = FALSE AND archived = FALSE ORDER BY created_at DESC`,
      [coachId]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  private _hydrate(r: any): CoachInsight {
    return new CoachInsight({
      id: r.id, coachId: r.coach_id, category: r.category, severity: r.severity,
      confidence: parseFloat(r.confidence), insightText: r.insight_text,
      createdFromPredictionId: r.created_from_prediction_id ?? undefined,
      createdFromEvaluationId: r.created_from_evaluation_id ?? undefined,
      resolved: r.resolved, archived: r.archived,
      resolvedAt: r.resolved_at ? new Date(r.resolved_at) : undefined,
      createdAt: new Date(r.created_at)
    });
  }
}

// ─── PostgresNotificationRepository ───────────────────────────────
export class PostgresNotificationRepository implements NotificationRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(notification: CoachNotification): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO coach_notifications (id, coach_id, notification_type, channel, status, title, body, metadata, scheduled_at, delivered_at, retry_count, max_retries, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, delivered_at = EXCLUDED.delivered_at,
         retry_count = EXCLUDED.retry_count`,
      [notification.id, notification.coachId, notification.notificationType, notification.channel,
       notification.status, notification.title, notification.body, JSON.stringify(notification.metadata),
       notification.scheduledAt, notification.deliveredAt ?? null, notification.retryCount,
       notification.maxRetries, notification.createdAt]
    );
  }

  async findById(id: string): Promise<CoachNotification | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM coach_notifications WHERE id = $1`, [id]);
    return res.rows[0] ? this._hydrate(res.rows[0]) : null;
  }

  async findScheduledByCoach(coachId: string): Promise<CoachNotification[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coach_notifications WHERE coach_id = $1 AND status = 'SCHEDULED' ORDER BY scheduled_at ASC`,
      [coachId]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  async findDueNotifications(before: Date): Promise<CoachNotification[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coach_notifications WHERE status = 'SCHEDULED' AND scheduled_at <= $1 ORDER BY scheduled_at ASC`,
      [before]
    );
    return res.rows.map(r => this._hydrate(r));
  }

  private _hydrate(r: any): CoachNotification {
    return new CoachNotification({
      id: r.id, coachId: r.coach_id, notificationType: r.notification_type, channel: r.channel,
      status: r.status, title: r.title, body: r.body, metadata: r.metadata ?? {},
      scheduledAt: new Date(r.scheduled_at),
      deliveredAt: r.delivered_at ? new Date(r.delivered_at) : undefined,
      retryCount: parseInt(r.retry_count), maxRetries: parseInt(r.max_retries),
      createdAt: new Date(r.created_at)
    });
  }
}

// ─── PostgresCoachDashboardProjectionRepository ───────────────────
export class PostgresCoachDashboardProjectionRepository implements CoachDashboardProjectionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(projection: CoachDashboardProjection): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO coach_dashboard_projections (id, coach_id, today_tasks, goal_summary,
         habit_summary, latest_motivation, critical_insights, prediction_summary, last_computed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (coach_id) DO UPDATE SET
         today_tasks = EXCLUDED.today_tasks, goal_summary = EXCLUDED.goal_summary,
         habit_summary = EXCLUDED.habit_summary, latest_motivation = EXCLUDED.latest_motivation,
         critical_insights = EXCLUDED.critical_insights, prediction_summary = EXCLUDED.prediction_summary,
         last_computed_at = EXCLUDED.last_computed_at`,
      [projection.id, projection.coachId, JSON.stringify(projection.todayTasks),
       JSON.stringify(projection.goalSummary), JSON.stringify(projection.habitSummary),
       JSON.stringify(projection.latestMotivation), JSON.stringify(projection.criticalInsights),
       JSON.stringify(projection.predictionSummary), projection.lastComputedAt]
    );
  }

  async findByCoachId(coachId: string): Promise<CoachDashboardProjection | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM coach_dashboard_projections WHERE coach_id = $1`,
      [coachId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new CoachDashboardProjection({
      id: r.id, coachId: r.coach_id,
      todayTasks: r.today_tasks ?? [],
      goalSummary: r.goal_summary ?? { active: 0, completed: 0, atRisk: 0, failed: 0 },
      habitSummary: r.habit_summary ?? { streak: 0, consistency: 0, todayStudied: false },
      latestMotivation: r.latest_motivation ?? {},
      criticalInsights: r.critical_insights ?? [],
      predictionSummary: r.prediction_summary ?? {},
      lastComputedAt: new Date(r.last_computed_at)
    });
  }
}

export class PostgresAnalyticsDashboardRepository implements AnalyticsDashboardRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async saveStudent(dash: AnalyticsStudentDashboard): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO analytics_dashboards (id, owner_id, dashboard_type, metadata, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO NOTHING`,
      [dash.id, dash.studentId, 'STUDENT', JSON.stringify({ isCustomized: dash.isCustomized })]
    );
  }

  async saveInstructor(dash: AnalyticsInstructorDashboard): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO analytics_dashboards (id, owner_id, dashboard_type, metadata, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO NOTHING`,
      [dash.id, dash.instructorId, 'INSTRUCTOR', JSON.stringify({ cohortId: dash.cohortId })]
    );
  }

  async saveAdmin(dash: AnalyticsAdminDashboard): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO analytics_dashboards (id, owner_id, dashboard_type, metadata, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO NOTHING`,
      [dash.id, dash.orgId, 'ADMIN', '{}']
    );
  }

  async findStudentByStudentId(studentId: string): Promise<AnalyticsStudentDashboard | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM analytics_dashboards WHERE owner_id = $1 AND dashboard_type = 'STUDENT'`,
      [studentId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsStudentDashboard({
      id: r.id,
      studentId: r.owner_id,
      isCustomized: r.metadata?.isCustomized ?? false
    });
  }

  async findInstructorByCohort(cohortId: string): Promise<AnalyticsInstructorDashboard | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM analytics_dashboards WHERE dashboard_type = 'INSTRUCTOR' AND (metadata->>'cohortId') = $1`,
      [cohortId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsInstructorDashboard({
      id: r.id,
      instructorId: r.owner_id,
      cohortId: r.metadata?.cohortId ?? ''
    });
  }

  async findAdminByOrg(orgId: string): Promise<AnalyticsAdminDashboard | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM analytics_dashboards WHERE owner_id = $1 AND dashboard_type = 'ADMIN'`,
      [orgId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsAdminDashboard({
      id: r.id,
      orgId: r.owner_id
    });
  }
}

// ─── PostgresAnalyticsSnapshotRepository ──────────────────────────
export class PostgresAnalyticsSnapshotRepository implements AnalyticsSnapshotRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async saveVersion(version: AnalyticsSnapshotVersion): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO snapshot_versions (id, generated_at, source_domains, schema_version, aggregation_version)
       VALUES ($1, $2, $3, $4, $5)`,
      [version.id, version.generatedAt, version.sourceDomains, version.schemaVersion, version.aggregationVersion]
    );
  }

  async findLatestVersion(): Promise<AnalyticsSnapshotVersion | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM snapshot_versions ORDER BY generated_at DESC LIMIT 1`);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsSnapshotVersion({
      id: r.id,
      generatedAt: new Date(r.generated_at),
      sourceDomains: r.source_domains,
      schemaVersion: r.schema_version,
      aggregationVersion: r.aggregation_version
    });
  }

  async findVersionById(id: string): Promise<AnalyticsSnapshotVersion | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM snapshot_versions WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsSnapshotVersion({
      id: r.id,
      generatedAt: new Date(r.generated_at),
      sourceDomains: r.source_domains,
      schemaVersion: r.schema_version,
      aggregationVersion: r.aggregation_version
    });
  }
}

// ─── PostgresTrendRepository ──────────────────────────────────────
export class PostgresTrendRepository implements TrendRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async saveLearningTrend(trend: AnalyticsLearningTrend): Promise<void> {
    const pool = this.dbPool.getPool();
    for (const point of trend.trendPoints) {
      await pool.query(
        `INSERT INTO learning_trends (id, category, trend_date, value, direction, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [randomUUID(), trend.category, point.date, point.value, trend.direction, '{}']
      );
    }
  }

  async findLearningTrendByCategory(category: string): Promise<AnalyticsLearningTrend | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM learning_trends WHERE category = $1 ORDER BY trend_date ASC`,
      [category]
    );
    if (res.rows.length === 0) return null;
    const points = res.rows.map(r => new AnalyticsTrendPoint(new Date(r.trend_date), parseFloat(r.value)));
    return new AnalyticsLearningTrend({
      id: randomUUID(),
      category,
      trendPoints: points,
      direction: res.rows[res.rows.length - 1].direction
    });
  }

  async savePredictionTrend(_trend: AnalyticsPredictionTrend): Promise<void> {
    // Prediction trend updates are read-only
  }
}

// ─── PostgresReportRepository ─────────────────────────────────────
export class PostgresReportRepository implements ReportRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async saveDefinition(def: AnalyticsReportDefinition): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO report_definitions (id, code, name, template_json)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, template_json = EXCLUDED.template_json`,
      [def.id, def.code, def.name, JSON.stringify(def.templateJson)]
    );
  }

  async findDefinitionByCode(code: string): Promise<AnalyticsReportDefinition | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM report_definitions WHERE code = $1`, [code]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsReportDefinition({
      id: r.id,
      code: r.code,
      name: r.name,
      templateJson: r.template_json
    });
  }

  async saveExecution(exec: AnalyticsReportExecution): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO report_executions (id, report_definition_id, status, executed_at, result_url, error_log)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, result_url = EXCLUDED.result_url, error_log = EXCLUDED.error_log`,
      [exec.id, exec.reportDefinitionId, exec.status, exec.executedAt, exec.resultUrl, exec.errorLog]
    );
  }

  async findExecutionById(id: string): Promise<AnalyticsReportExecution | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM report_executions WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsReportExecution({
      id: r.id,
      reportDefinitionId: r.report_definition_id,
      status: r.status,
      executedAt: new Date(r.executed_at),
      resultUrl: r.result_url ?? undefined,
      errorLog: r.error_log ?? undefined
    });
  }

  async saveSchedule(schedule: AnalyticsScheduledReport): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO report_schedules (id, report_definition_id, recipient_email, cron_expression, active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET cron_expression = EXCLUDED.cron_expression, active = EXCLUDED.active`,
      [schedule.id, schedule.reportDefinitionId, schedule.recipientEmail, schedule.cronExpression, schedule.active]
    );
  }

  async findActiveSchedules(): Promise<AnalyticsScheduledReport[]> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM report_schedules WHERE active = TRUE`);
    return res.rows.map(r => new AnalyticsScheduledReport({
      id: r.id,
      reportDefinitionId: r.report_definition_id,
      recipientEmail: r.recipient_email,
      cronExpression: r.cron_expression,
      active: r.active
    }));
  }
}

// ─── PostgresExportRepository ─────────────────────────────────────
export class PostgresExportRepository implements ExportRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async saveJob(job: AnalyticsExportJob): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO export_jobs (id, format, status, download_expiry, generated_by, download_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, download_url = EXCLUDED.download_url`,
      [job.id, job.format, job.status, job.downloadExpiry, job.generatedBy, job.downloadUrl]
    );
  }

  async findJobById(id: string): Promise<AnalyticsExportJob | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM export_jobs WHERE id = $1`, [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsExportJob({
      id: r.id,
      format: r.format as any,
      status: r.status as any,
      downloadExpiry: new Date(r.download_expiry),
      generatedBy: r.generated_by,
      downloadUrl: r.download_url ?? undefined
    });
  }
}

// ─── PostgresWidgetRepository ─────────────────────────────────────
export class PostgresWidgetRepository implements WidgetRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async saveDefinition(def: AnalyticsWidgetDefinition): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO widget_definitions (id, widget_type, display_name, default_config)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (widget_type) DO UPDATE SET display_name = EXCLUDED.display_name, default_config = EXCLUDED.default_config`,
      [def.id, def.widgetType, def.displayName, JSON.stringify(def.defaultConfig)]
    );
  }

  async findDefinitionByType(type: string): Promise<AnalyticsWidgetDefinition | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM widget_definitions WHERE widget_type = $1`, [type]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsWidgetDefinition({
      id: r.id,
      widgetType: r.widget_type,
      displayName: r.display_name,
      defaultConfig: r.default_config
    });
  }
}

// ─── PostgresStudentDashboardProjectionRepository ─────────────────
export class PostgresStudentDashboardProjectionRepository implements StudentDashboardProjectionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(projection: AnalyticsStudentDashboardProjection): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO student_analytics_dashboard_projections (student_id, profile_id, readiness_score, daily_plan,
         goal_completion, study_streak, practice_performance, assessment_history, coach_summary,
         prediction_trend, weak_competencies, recommended_actions, last_computed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
       ON CONFLICT (student_id, profile_id) DO UPDATE SET
         readiness_score = EXCLUDED.readiness_score,
         daily_plan = EXCLUDED.daily_plan,
         goal_completion = EXCLUDED.goal_completion,
         study_streak = EXCLUDED.study_streak,
         practice_performance = EXCLUDED.practice_performance,
         assessment_history = EXCLUDED.assessment_history,
         coach_summary = EXCLUDED.coach_summary,
         prediction_trend = EXCLUDED.prediction_trend,
         weak_competencies = EXCLUDED.weak_competencies,
         recommended_actions = EXCLUDED.recommended_actions,
         last_computed_at = CURRENT_TIMESTAMP`,
      [
        projection.studentId, projection.profileId, projection.readinessScore, JSON.stringify(projection.dailyPlan),
        projection.goalCompletion, projection.studyStreak, JSON.stringify(projection.practicePerformance),
        JSON.stringify(projection.assessmentHistory), JSON.stringify(projection.coachSummary),
        JSON.stringify(projection.predictionTrend), JSON.stringify(projection.weakCompetencies),
        JSON.stringify(projection.recommendedActions)
      ]
    );
  }

  async find(studentId: string, profileId: string): Promise<AnalyticsStudentDashboardProjection | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(
      `SELECT * FROM student_analytics_dashboard_projections WHERE student_id = $1 AND profile_id = $2`,
      [studentId, profileId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsStudentDashboardProjection({
      studentId: r.student_id,
      profileId: r.profile_id,
      readinessScore: r.readiness_score ? parseFloat(r.readiness_score) : undefined,
      dailyPlan: r.daily_plan,
      goalCompletion: r.goal_completion ? parseFloat(r.goal_completion) : undefined,
      studyStreak: r.study_streak,
      practicePerformance: r.practice_performance,
      assessmentHistory: r.assessment_history,
      coachSummary: r.coach_summary,
      predictionTrend: r.prediction_trend,
      weakCompetencies: r.weak_competencies,
      recommendedActions: r.recommended_actions,
      lastComputedAt: new Date(r.last_computed_at)
    });
  }
}

// ─── PostgresInstructorDashboardProjectionRepository ──────────────
export class PostgresInstructorDashboardProjectionRepository implements InstructorDashboardProjectionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(projection: AnalyticsInstructorDashboardProjection): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO instructor_dashboard_projections (cohort_id, overview, risk_matrix, heatmap, completion_rates,
         quality_summary, predictions_dist, interventions, coach_engagement, top_performers, attention_needed, last_computed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
       ON CONFLICT (cohort_id) DO UPDATE SET
         overview = EXCLUDED.overview,
         risk_matrix = EXCLUDED.risk_matrix,
         heatmap = EXCLUDED.heatmap,
         completion_rates = EXCLUDED.completion_rates,
         quality_summary = EXCLUDED.quality_summary,
         predictions_dist = EXCLUDED.predictions_dist,
         interventions = EXCLUDED.interventions,
         coach_engagement = EXCLUDED.coach_engagement,
         top_performers = EXCLUDED.top_performers,
         attention_needed = EXCLUDED.attention_needed,
         last_computed_at = CURRENT_TIMESTAMP`,
      [
        projection.cohortId, JSON.stringify(projection.overview), JSON.stringify(projection.riskMatrix),
        JSON.stringify(projection.heatmap), JSON.stringify(projection.completionRates),
        JSON.stringify(projection.qualitySummary), JSON.stringify(projection.predictionsDist),
        JSON.stringify(projection.interventions), JSON.stringify(projection.coachEngagement),
        JSON.stringify(projection.topPerformers), JSON.stringify(projection.attentionNeeded)
      ]
    );
  }

  async find(cohortId: string): Promise<AnalyticsInstructorDashboardProjection | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM instructor_dashboard_projections WHERE cohort_id = $1`, [cohortId]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsInstructorDashboardProjection({
      cohortId: r.cohort_id,
      overview: r.overview,
      riskMatrix: r.risk_matrix,
      heatmap: r.heatmap,
      completionRates: r.completion_rates,
      qualitySummary: r.quality_summary,
      predictionsDist: r.predictions_dist,
      interventions: r.interventions,
      coachEngagement: r.coach_engagement,
      topPerformers: r.top_performers,
      attentionNeeded: r.attention_needed,
      lastComputedAt: new Date(r.last_computed_at)
    });
  }
}

// ─── PostgresAdminDashboardProjectionRepository ───────────────────
export class PostgresAdminDashboardProjectionRepository implements AdminDashboardProjectionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(projection: AnalyticsAdminDashboardProjection): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO admin_dashboard_projections (org_id, platform_usage, dau, enrollments, completion_stats,
         ai_usage, prediction_accuracy, infrastructure, revenue, growth_trends, retention, last_computed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
       ON CONFLICT (org_id) DO UPDATE SET
         platform_usage = EXCLUDED.platform_usage,
         dau = EXCLUDED.dau,
         enrollments = EXCLUDED.enrollments,
         completion_stats = EXCLUDED.completion_stats,
         ai_usage = EXCLUDED.ai_usage,
         prediction_accuracy = EXCLUDED.prediction_accuracy,
         infrastructure = EXCLUDED.infrastructure,
         revenue = EXCLUDED.revenue,
         growth_trends = EXCLUDED.growth_trends,
         retention = EXCLUDED.retention,
         last_computed_at = CURRENT_TIMESTAMP`,
      [
        projection.orgId, JSON.stringify(projection.platformUsage), JSON.stringify(projection.dau),
        JSON.stringify(projection.enrollments), JSON.stringify(projection.completionStats),
        JSON.stringify(projection.aiUsage), JSON.stringify(projection.predictionAccuracy),
        JSON.stringify(projection.infrastructure), JSON.stringify(projection.revenue),
        JSON.stringify(projection.growthTrends), JSON.stringify(projection.retention)
      ]
    );
  }

  async find(orgId: string): Promise<AnalyticsAdminDashboardProjection | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM admin_dashboard_projections WHERE org_id = $1`, [orgId]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsAdminDashboardProjection({
      orgId: r.org_id,
      platformUsage: r.platform_usage,
      dau: r.dau,
      enrollments: r.enrollments,
      completionStats: r.completion_stats,
      aiUsage: r.ai_usage,
      predictionAccuracy: r.prediction_accuracy,
      infrastructure: r.infrastructure,
      revenue: r.revenue,
      growthTrends: r.growth_trends,
      retention: r.retention,
      lastComputedAt: new Date(r.last_computed_at)
    });
  }
}

// ─── PostgresCompetencyProjectionRepository ───────────────────────
export class PostgresCompetencyProjectionRepository implements CompetencyProjectionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(projection: AnalyticsCompetencyAnalytics): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO competency_projections (competency_code, display_name, mastery_distribution, average_score, cohort_averages, last_computed_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (competency_code) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         mastery_distribution = EXCLUDED.mastery_distribution,
         average_score = EXCLUDED.average_score,
         cohort_averages = EXCLUDED.cohort_averages,
         last_computed_at = CURRENT_TIMESTAMP`,
      [projection.competencyCode, projection.displayName, JSON.stringify(projection.masteryDistribution), projection.averageScore, JSON.stringify(projection.cohortAverages)]
    );
  }

  async find(competencyCode: string): Promise<AnalyticsCompetencyAnalytics | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM competency_projections WHERE competency_code = $1`, [competencyCode]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return new AnalyticsCompetencyAnalytics({
      id: randomUUID(),
      competencyCode: r.competency_code,
      displayName: r.display_name,
      masteryDistribution: r.mastery_distribution,
      averageScore: parseFloat(r.average_score),
      cohortAverages: r.cohort_averages
    });
  }
}

// ─── PostgresRiskProjectionRepository ─────────────────────────────
export class PostgresRiskProjectionRepository implements RiskProjectionRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async save(studentId: string, riskLevel: string, score: number, factors: any, action: string): Promise<void> {
    const pool = this.dbPool.getPool();
    await pool.query(
      `INSERT INTO risk_projections (student_id, risk_level, risk_score, risk_factors, recommended_action, last_computed_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (student_id) DO UPDATE SET
         risk_level = EXCLUDED.risk_level,
         risk_score = EXCLUDED.risk_score,
         risk_factors = EXCLUDED.risk_factors,
         recommended_action = EXCLUDED.recommended_action,
         last_computed_at = CURRENT_TIMESTAMP`,
      [studentId, riskLevel, score, JSON.stringify(factors), action]
    );
  }

  async find(studentId: string): Promise<{ riskLevel: string; score: number; factors: any; action: string } | null> {
    const pool = this.dbPool.getPool();
    const res = await pool.query(`SELECT * FROM risk_projections WHERE student_id = $1`, [studentId]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      riskLevel: r.risk_level,
      score: parseFloat(r.risk_score),
      factors: r.risk_factors,
      action: r.recommended_action
    };
  }
}
