-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: 01003_learning_coach_indexes.sql
-- Domain:    AI Learning Coach
-- Purpose:   Performance indexes for all coach tables.
-- ══════════════════════════════════════════════════════════════════════════════

-- learning_coaches
CREATE INDEX IF NOT EXISTS idx_learning_coaches_student_profile
  ON learning_coaches (student_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_learning_coaches_status
  ON learning_coaches (status);

-- coach_brains
CREATE INDEX IF NOT EXISTS idx_coach_brains_coach_id
  ON coach_brains (coach_id);

-- coach_memory
CREATE INDEX IF NOT EXISTS idx_coach_memory_coach_id
  ON coach_memory (coach_id);

-- coaching_sessions
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach_status
  ON coaching_sessions (coach_id, status);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_started_at
  ON coaching_sessions (coach_id, started_at DESC);

-- coaching_plans
CREATE INDEX IF NOT EXISTS idx_coaching_plans_coach_status
  ON coaching_plans (coach_id, status);
CREATE INDEX IF NOT EXISTS idx_coaching_plans_dates
  ON coaching_plans (coach_id, start_date, end_date);

-- daily_study_plans
CREATE INDEX IF NOT EXISTS idx_daily_study_plans_coach_date
  ON daily_study_plans (coach_id, plan_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_study_plans_status
  ON daily_study_plans (coach_id, status);

-- study_plan_tasks
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_plan_status
  ON study_plan_tasks (daily_plan_id, status);
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_sort
  ON study_plan_tasks (daily_plan_id, sort_order ASC);

-- revision_plans
CREATE INDEX IF NOT EXISTS idx_revision_plans_coach_status
  ON revision_plans (coach_id, status);
CREATE INDEX IF NOT EXISTS idx_revision_plans_dates
  ON revision_plans (coach_id, start_date);

-- study_goals
CREATE INDEX IF NOT EXISTS idx_study_goals_coach_type_status
  ON study_goals (coach_id, goal_type, status);
CREATE INDEX IF NOT EXISTS idx_study_goals_deadline
  ON study_goals (coach_id, deadline ASC);
CREATE INDEX IF NOT EXISTS idx_study_goals_at_risk
  ON study_goals (coach_id, status) WHERE status = 'AT_RISK';

-- coach_conversations
CREATE INDEX IF NOT EXISTS idx_coach_conversations_coach_status
  ON coach_conversations (coach_id, status);
CREATE INDEX IF NOT EXISTS idx_coach_conversations_started_at
  ON coach_conversations (coach_id, started_at DESC);

-- conversation_messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation
  ON conversation_messages (conversation_id, created_at ASC);

-- conversation_insights
CREATE INDEX IF NOT EXISTS idx_conversation_insights_coach
  ON conversation_insights (coach_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_insights_unresolved
  ON conversation_insights (coach_id, resolved) WHERE resolved = FALSE;

-- habit_trackers
CREATE INDEX IF NOT EXISTS idx_habit_trackers_coach_date
  ON habit_trackers (coach_id, habit_date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_trackers_studied
  ON habit_trackers (coach_id, studied);

-- habit_events
CREATE INDEX IF NOT EXISTS idx_habit_events_tracker
  ON habit_events (habit_tracker_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_habit_events_coach_type
  ON habit_events (coach_id, event_type);

-- habit_analytics
CREATE INDEX IF NOT EXISTS idx_habit_analytics_coach_period
  ON habit_analytics (coach_id, period_type, period_start DESC);

-- reflection_journals
CREATE INDEX IF NOT EXISTS idx_reflection_journals_coach_date
  ON reflection_journals (coach_id, recorded_at DESC);

-- coach_insights
CREATE INDEX IF NOT EXISTS idx_coach_insights_coach_category
  ON coach_insights (coach_id, category, severity);
CREATE INDEX IF NOT EXISTS idx_coach_insights_unresolved
  ON coach_insights (coach_id, resolved, archived) WHERE resolved = FALSE AND archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_coach_insights_critical
  ON coach_insights (coach_id) WHERE severity = 'CRITICAL' AND resolved = FALSE;

-- coach_recommendations
CREATE INDEX IF NOT EXISTS idx_coach_recommendations_coach_type
  ON coach_recommendations (coach_id, recommendation_type, priority);
CREATE INDEX IF NOT EXISTS idx_coach_recommendations_pending
  ON coach_recommendations (coach_id, status) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_coach_recommendations_critical
  ON coach_recommendations (coach_id) WHERE priority = 'CRITICAL' AND status = 'PENDING';

-- coach_notifications
CREATE INDEX IF NOT EXISTS idx_coach_notifications_scheduled
  ON coach_notifications (coach_id, scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_coach_notifications_pending
  ON coach_notifications (status, scheduled_at) WHERE status = 'SCHEDULED';

-- coach_dashboard_projections
CREATE INDEX IF NOT EXISTS idx_coach_dashboard_projections_coach
  ON coach_dashboard_projections (coach_id);

-- prompt_catalogue
CREATE INDEX IF NOT EXISTS idx_coach_prompt_catalogue_key_active
  ON coach_prompt_catalogue (prompt_key, is_active);
CREATE INDEX IF NOT EXISTS idx_coach_prompt_catalogue_engine
  ON coach_prompt_catalogue (engine_type, is_active);
