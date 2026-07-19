-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: 01000_learning_coach.sql
-- Domain:    AI Learning Coach
-- Purpose:   Creates 23 core tables for the AI Learning Coach bounded context.
--            The Coach orchestrates all previous domains without owning their data.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- 1. LEARNING COACHES (Aggregate Root — small & lightweight)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_coaches (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID NOT NULL,
  profile_id            UUID NOT NULL,
  status                TEXT NOT NULL DEFAULT 'ACTIVE'
                          CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, profile_id)
);

-- ─────────────────────────────────────────────────────────────────
-- 2. COACH BRAINS (Separated "intelligent" aggregate)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_brains (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  coaching_style_tone   TEXT NOT NULL DEFAULT 'ENCOURAGING'
                          CHECK (coaching_style_tone IN ('ENCOURAGING', 'DIRECT', 'ANALYTICAL')),
  coaching_style_pacing TEXT NOT NULL DEFAULT 'BALANCED'
                          CHECK (coaching_style_pacing IN ('INTENSIVE', 'BALANCED', 'RELAXED')),
  active_engine         TEXT NOT NULL DEFAULT 'RULE_BASED'
                          CHECK (active_engine IN ('RULE_BASED', 'OPENAI', 'CLAUDE', 'GEMINI', 'OLLAMA')),
  llm_model_id          TEXT,
  prompt_version        TEXT NOT NULL DEFAULT 'v1.0.0',
  last_active_at        TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coach_id)
);

-- ─────────────────────────────────────────────────────────────────
-- 3. COACH MEMORY (Long-term learner memory — persists across sessions)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_memory (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id                  UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  preferred_study_hours     JSONB NOT NULL DEFAULT '[]',   -- [{ hour: 9, day: "Monday" }]
  preferred_learning_style  TEXT NOT NULL DEFAULT 'VISUAL'
                              CHECK (preferred_learning_style IN ('VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MIXED')),
  preferred_motivation_style TEXT NOT NULL DEFAULT 'ENCOURAGEMENT'
                              CHECK (preferred_motivation_style IN ('ENCOURAGEMENT', 'CHALLENGE', 'ANALYTICAL', 'SOCIAL', 'AUTONOMY')),
  recurring_mistakes        JSONB NOT NULL DEFAULT '[]',   -- ["Verb tense confusion", "Passive voice"]
  strongest_subjects        JSONB NOT NULL DEFAULT '[]',   -- ["Reading", "Vocabulary"]
  weakest_competencies      JSONB NOT NULL DEFAULT '[]',   -- ["Writing Coherence", "Grammar C1"]
  recurring_questions       JSONB NOT NULL DEFAULT '[]',   -- Common questions student asks
  key_milestones            JSONB NOT NULL DEFAULT '[]',   -- Achieved milestones
  notes                     TEXT,
  version                   INTEGER NOT NULL DEFAULT 1,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coach_id)
);

-- ─────────────────────────────────────────────────────────────────
-- 4. MOTIVATION PROFILES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS motivation_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  archetype             TEXT NOT NULL DEFAULT 'GOAL_DRIVEN'
                          CHECK (archetype IN ('GOAL_DRIVEN', 'ANXIETY_PRONE', 'SOCIAL_LEARNER', 'SELF_DIRECTED', 'COMPETITIVE', 'REFLECTIVE')),
  risk_tolerance        TEXT NOT NULL DEFAULT 'MEDIUM'
                          CHECK (risk_tolerance IN ('LOW', 'MEDIUM', 'HIGH')),
  preferred_feedback    TEXT NOT NULL DEFAULT 'POSITIVE_FIRST'
                          CHECK (preferred_feedback IN ('POSITIVE_FIRST', 'DIRECT', 'ANALYTICAL', 'NARRATIVE')),
  milestone_count       INTEGER NOT NULL DEFAULT 0,
  last_milestone_at     TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coach_id)
);

-- ─────────────────────────────────────────────────────────────────
-- 5. COACHING SESSIONS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  session_type          TEXT NOT NULL DEFAULT 'DAILY_CHECK_IN'
                          CHECK (session_type IN ('DAILY_CHECK_IN', 'WEEKLY_REVIEW', 'GOAL_SETTING', 'REVISION_PLANNING', 'MOTIVATION', 'REFLECTION', 'INTERVENTION_FOLLOW_UP', 'EXAM_PREPARATION')),
  status                TEXT NOT NULL DEFAULT 'ACTIVE'
                          CHECK (status IN ('ACTIVE', 'COMPLETED', 'ABANDONED')),
  started_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at              TIMESTAMPTZ,
  duration_seconds      INTEGER,
  summary               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 6. COACHING PLANS (Strategic — weekly/monthly)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coaching_plans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  plan_type             TEXT NOT NULL DEFAULT 'WEEKLY'
                          CHECK (plan_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'EXAM_COUNTDOWN')),
  status                TEXT NOT NULL DEFAULT 'ACTIVE'
                          CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
  snapshot_id           UUID,                              -- Reference to prediction snapshot
  prediction_score      NUMERIC(5,2),
  start_date            DATE NOT NULL,
  end_date              DATE NOT NULL,
  focus_competencies    JSONB NOT NULL DEFAULT '[]',
  priority_areas        JSONB NOT NULL DEFAULT '[]',
  generated_by_engine   TEXT NOT NULL DEFAULT 'RULE_BASED',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 7. DAILY STUDY PLANS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_study_plans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  coaching_plan_id      UUID REFERENCES coaching_plans(id) ON DELETE SET NULL,
  plan_date             DATE NOT NULL,
  status                TEXT NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'RESCHEDULED')),
  total_minutes         INTEGER NOT NULL DEFAULT 60,
  completed_minutes     INTEGER NOT NULL DEFAULT 0,
  completion_rate       NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coach_id, plan_date)
);

-- ─────────────────────────────────────────────────────────────────
-- 8. STUDY PLAN TASKS (line items under a daily plan)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_plan_tasks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_plan_id         UUID NOT NULL REFERENCES daily_study_plans(id) ON DELETE CASCADE,
  task_type             TEXT NOT NULL
                          CHECK (task_type IN ('PRACTICE', 'REVISION', 'READING', 'WRITING', 'LISTENING', 'SPEAKING', 'VOCABULARY', 'GRAMMAR', 'MOCK_EXAM', 'REST', 'BREAK', 'REFLECTION', 'GOAL', 'RESOURCE')),
  competency_code       TEXT,
  resource_id           UUID,
  title                 TEXT NOT NULL,
  description           TEXT,
  estimated_minutes     INTEGER NOT NULL DEFAULT 20,
  priority              INTEGER NOT NULL DEFAULT 3,
  status                TEXT NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')),
  completed_at          TIMESTAMPTZ,
  sort_order            INTEGER NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────────
-- 9. REVISION PLANS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS revision_plans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  campaign_type         TEXT NOT NULL DEFAULT 'REVISION_A'
                          CHECK (campaign_type IN ('REVISION_A', 'REVISION_B', 'MOCK', 'FINAL_WEEK', 'EXAM_DAY')),
  status                TEXT NOT NULL DEFAULT 'DRAFT'
                          CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
  start_date            DATE NOT NULL,
  end_date              DATE NOT NULL,
  focus_areas           JSONB NOT NULL DEFAULT '[]',
  exam_date             DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 10. STUDY GOALS (with full state machine)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_goals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  goal_type             TEXT NOT NULL
                          CHECK (goal_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'EXAM')),
  status                TEXT NOT NULL DEFAULT 'CREATED'
                          CHECK (status IN ('CREATED', 'ACTIVE', 'AT_RISK', 'PAUSED', 'COMPLETED', 'FAILED', 'ARCHIVED')),
  title                 TEXT NOT NULL,
  description           TEXT,
  target_value          NUMERIC(10,2),
  current_value         NUMERIC(10,2) NOT NULL DEFAULT 0,
  target_unit           TEXT,                               -- "score", "minutes", "sessions", "percent"
  target_competency     TEXT,
  deadline              DATE,
  completed_at          TIMESTAMPTZ,
  failed_at             TIMESTAMPTZ,
  paused_at             TIMESTAMPTZ,
  paused_reason         TEXT,
  risk_detected_at      TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 11. COACH CONVERSATIONS (container aggregate)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_conversations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  session_id            UUID REFERENCES coaching_sessions(id) ON DELETE SET NULL,
  topic                 TEXT,
  status                TEXT NOT NULL DEFAULT 'ACTIVE'
                          CHECK (status IN ('ACTIVE', 'SUMMARISED', 'ARCHIVED')),
  message_count         INTEGER NOT NULL DEFAULT 0,
  total_tokens          INTEGER NOT NULL DEFAULT 0,
  started_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at              TIMESTAMPTZ,
  archived_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 12. CONVERSATION MESSAGES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_messages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id       UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
  role                  TEXT NOT NULL CHECK (role IN ('STUDENT', 'COACH', 'SYSTEM')),
  content               TEXT NOT NULL,
  token_count           INTEGER NOT NULL DEFAULT 0,
  metadata              JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 13. CONVERSATION SUMMARIES (per-session memory window)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id       UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
  topics_covered        JSONB NOT NULL DEFAULT '[]',
  key_insights          JSONB NOT NULL DEFAULT '[]',
  follow_up_actions     JSONB NOT NULL DEFAULT '[]',
  token_count           INTEGER NOT NULL DEFAULT 0,
  summarised_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 14. CONVERSATION INSIGHTS (extracted from conversation)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_insights (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id       UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  category              TEXT NOT NULL,
  insight_text          TEXT NOT NULL,
  confidence            NUMERIC(4,3) NOT NULL DEFAULT 0.800,
  resolved              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 15. HABIT TRACKERS (daily check-in aggregate)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_trackers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  habit_date            DATE NOT NULL,
  studied               BOOLEAN NOT NULL DEFAULT FALSE,
  study_minutes         INTEGER NOT NULL DEFAULT 0,
  session_count         INTEGER NOT NULL DEFAULT 0,
  focus_score           NUMERIC(4,2),                      -- 0.00-10.00
  mood                  TEXT CHECK (mood IN ('GREAT', 'GOOD', 'NEUTRAL', 'TIRED', 'STRESSED')),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coach_id, habit_date)
);

-- ─────────────────────────────────────────────────────────────────
-- 16. HABIT EVENTS (granular event log)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  habit_tracker_id      UUID NOT NULL REFERENCES habit_trackers(id) ON DELETE CASCADE,
  event_type            TEXT NOT NULL
                          CHECK (event_type IN ('STUDY_START', 'STUDY_END', 'BREAK_START', 'BREAK_END', 'REMINDER_SENT', 'REMINDER_ACKNOWLEDGED', 'GOAL_CHECKED')),
  occurred_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata              JSONB NOT NULL DEFAULT '{}'
);

-- ─────────────────────────────────────────────────────────────────
-- 17. HABIT ANALYTICS (pre-computed — avoids repeated recalculation)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_analytics (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  period_type           TEXT NOT NULL CHECK (period_type IN ('WEEKLY', 'MONTHLY')),
  period_start          DATE NOT NULL,
  period_end            DATE NOT NULL,
  current_streak        INTEGER NOT NULL DEFAULT 0,
  longest_streak        INTEGER NOT NULL DEFAULT 0,
  weekly_consistency    NUMERIC(5,2) NOT NULL DEFAULT 0.00,   -- % of days studied
  monthly_consistency   NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  avg_session_minutes   NUMERIC(7,2) NOT NULL DEFAULT 0.00,
  best_study_hour       INTEGER,                               -- 0-23
  worst_study_hour      INTEGER,
  study_velocity        NUMERIC(7,2) NOT NULL DEFAULT 0.00,   -- minutes/day trend
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coach_id, period_type, period_start)
);

-- ─────────────────────────────────────────────────────────────────
-- 18. REFLECTION JOURNALS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reflection_journals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  session_id            UUID REFERENCES coaching_sessions(id) ON DELETE SET NULL,
  mood                  TEXT NOT NULL DEFAULT 'NEUTRAL'
                          CHECK (mood IN ('VERY_POSITIVE', 'POSITIVE', 'NEUTRAL', 'NEGATIVE', 'VERY_NEGATIVE')),
  difficulty_rating     INTEGER NOT NULL DEFAULT 3 CHECK (difficulty_rating BETWEEN 1 AND 5),
  insights              TEXT,
  what_went_well        TEXT,
  what_was_difficult    TEXT,
  next_session_focus    TEXT,
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 19. COACH INSIGHTS (persistent insights across sessions — like CoachMemory signals)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_insights (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id                      UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  category                      TEXT NOT NULL
                                  CHECK (category IN ('READING', 'WRITING', 'LISTENING', 'SPEAKING', 'VOCABULARY', 'GRAMMAR', 'STRATEGY', 'MOTIVATION', 'HABIT', 'GENERAL')),
  severity                      TEXT NOT NULL DEFAULT 'MEDIUM'
                                  CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL')),
  confidence                    NUMERIC(4,3) NOT NULL DEFAULT 0.800,
  insight_text                  TEXT NOT NULL,
  created_from_prediction_id    UUID,
  created_from_evaluation_id    UUID,
  resolved                      BOOLEAN NOT NULL DEFAULT FALSE,
  archived                      BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at                   TIMESTAMPTZ,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 20. COACH RECOMMENDATIONS (registry-driven types)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_recommendations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  session_id            UUID REFERENCES coaching_sessions(id) ON DELETE SET NULL,
  recommendation_type   TEXT NOT NULL
                          CHECK (recommendation_type IN ('PRACTICE', 'REVISION', 'READING', 'WRITING', 'LISTENING', 'SPEAKING', 'VOCABULARY', 'GRAMMAR', 'MOCK_EXAM', 'REST', 'BREAK', 'MOTIVATION', 'REFLECTION', 'GOAL', 'RESOURCE')),
  priority              TEXT NOT NULL DEFAULT 'MEDIUM'
                          CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OPTIONAL')),
  title                 TEXT NOT NULL,
  description           TEXT,
  resource_id           UUID,
  competency_code       TEXT,
  status                TEXT NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING', 'ACKNOWLEDGED', 'COMPLETED', 'DISMISSED')),
  expires_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 21. COACH NOTIFICATIONS (queue with channel + retry)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_notifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  notification_type     TEXT NOT NULL
                          CHECK (notification_type IN ('STUDY_REMINDER', 'GOAL_DEADLINE', 'RISK_ALERT', 'MOTIVATION', 'ACHIEVEMENT', 'HABIT_STREAK', 'WEEKLY_SUMMARY', 'EXAM_COUNTDOWN')),
  channel               TEXT NOT NULL DEFAULT 'IN_APP'
                          CHECK (channel IN ('IN_APP', 'EMAIL', 'PUSH', 'SMS', 'WHATSAPP', 'CALENDAR')),
  status                TEXT NOT NULL DEFAULT 'SCHEDULED'
                          CHECK (status IN ('SCHEDULED', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED')),
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL,
  metadata              JSONB NOT NULL DEFAULT '{}',
  scheduled_at          TIMESTAMPTZ NOT NULL,
  delivered_at          TIMESTAMPTZ,
  retry_count           INTEGER NOT NULL DEFAULT 0,
  max_retries           INTEGER NOT NULL DEFAULT 3,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 22. COACH DASHBOARD PROJECTIONS (async pre-computed dashboard)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_dashboard_projections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id              UUID NOT NULL REFERENCES learning_coaches(id) ON DELETE CASCADE,
  today_tasks           JSONB NOT NULL DEFAULT '[]',
  goal_summary          JSONB NOT NULL DEFAULT '{}',        -- { active: N, completed: N, at_risk: N }
  habit_summary         JSONB NOT NULL DEFAULT '{}',        -- { streak: N, consistency: 0.85 }
  latest_motivation     JSONB NOT NULL DEFAULT '{}',
  critical_insights     JSONB NOT NULL DEFAULT '[]',
  prediction_summary    JSONB NOT NULL DEFAULT '{}',
  last_computed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coach_id)
);

-- ─────────────────────────────────────────────────────────────────
-- 23. PROMPT CATALOGUE (versioned coaching prompts for LLM provider)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_prompt_catalogue (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key            TEXT NOT NULL,                      -- e.g. 'daily_advice', 'revision_planning'
  display_name          TEXT NOT NULL,
  version               TEXT NOT NULL DEFAULT 'v1.0.0',
  engine_type           TEXT NOT NULL DEFAULT 'COACHING'
                          CHECK (engine_type IN ('COACHING', 'PLANNING', 'REVISION', 'MOTIVATION', 'REFLECTION', 'GOAL', 'CONVERSATION', 'INSIGHT')),
  template              TEXT NOT NULL,
  variables             JSONB NOT NULL DEFAULT '[]',        -- ["studentName", "weakAreas", "targetScore"]
  evaluation_score      NUMERIC(4,3),                       -- Human evaluation 0.000-1.000
  ab_test_group         TEXT CHECK (ab_test_group IN ('A', 'B', 'CONTROL')),
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  usage_count           INTEGER NOT NULL DEFAULT 0,
  avg_quality_score     NUMERIC(4,3),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (prompt_key, version)
);
