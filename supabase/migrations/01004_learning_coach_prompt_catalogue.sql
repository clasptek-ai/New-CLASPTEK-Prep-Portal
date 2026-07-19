-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: 01004_learning_coach_prompt_catalogue.sql
-- Domain:    AI Learning Coach
-- Purpose:   Extended prompt catalogue — evaluation metrics, versioning, A/B tests.
--            Separated from seed to allow independent lifecycle management.
-- ══════════════════════════════════════════════════════════════════════════════

-- Prompt evaluation scores table (tracks per-prompt quality ratings)
CREATE TABLE IF NOT EXISTS coach_prompt_evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id       UUID NOT NULL REFERENCES coach_prompt_catalogue(id) ON DELETE CASCADE,
  evaluator_role  TEXT NOT NULL DEFAULT 'HUMAN' CHECK (evaluator_role IN ('HUMAN', 'AUTO', 'A_B_TEST')),
  quality_score   NUMERIC(4,3) NOT NULL CHECK (quality_score BETWEEN 0.000 AND 1.000),
  coherence_score NUMERIC(4,3),
  relevance_score NUMERIC(4,3),
  safety_score    NUMERIC(4,3),
  notes           TEXT,
  evaluated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prompt usage metrics (tracks usage frequency and response quality)
CREATE TABLE IF NOT EXISTS coach_prompt_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id       UUID NOT NULL REFERENCES coach_prompt_catalogue(id) ON DELETE CASCADE,
  period_date     DATE NOT NULL,
  call_count      INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms  NUMERIC(9,2),
  error_count     INTEGER NOT NULL DEFAULT 0,
  avg_quality     NUMERIC(4,3),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (prompt_id, period_date)
);

-- Additional v2 prompt templates for A/B testing
INSERT INTO coach_prompt_catalogue (prompt_key, display_name, version, engine_type, template, variables, ab_test_group, is_active)
VALUES
  (
    'goal_risk_alert',
    'Goal At-Risk Warning',
    'v1.0.0',
    'GOAL',
    'Alert {{studentName}} that their {{goalType}} goal "{{goalTitle}}" is at risk. Current progress: {{currentValue}}/{{targetValue}} {{unit}}. Days remaining: {{daysRemaining}}. Suggest 2 corrective actions.',
    '["studentName","goalType","goalTitle","currentValue","targetValue","unit","daysRemaining"]',
    'CONTROL',
    TRUE
  ),
  (
    'weekly_plan_summary',
    'Weekly Plan Summary',
    'v1.0.0',
    'PLANNING',
    'Create a brief weekly summary for {{studentName}}. This week: {{completedTasks}}/{{totalTasks}} tasks completed. Streak: {{streak}} days. Top achievement: {{topAchievement}}. Next week focus: {{nextWeekFocus}}.',
    '["studentName","completedTasks","totalTasks","streak","topAchievement","nextWeekFocus"]',
    'CONTROL',
    TRUE
  ),
  (
    'exam_countdown',
    'Exam Countdown Message',
    'v1.0.0',
    'MOTIVATION',
    '{{studentName}}, your {{examType}} exam is in {{daysToExam}} days. Current readiness: {{readinessScore}}. You need {{requiredImprovement}} more points. Today''s priority: {{todayPriority}}. You can do this!',
    '["studentName","examType","daysToExam","readinessScore","requiredImprovement","todayPriority"]',
    'CONTROL',
    TRUE
  )
ON CONFLICT (prompt_key, version) DO NOTHING;

-- Indexes for prompt evaluation tables
CREATE INDEX IF NOT EXISTS idx_coach_prompt_evaluations_prompt
  ON coach_prompt_evaluations (prompt_id, evaluated_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_prompt_metrics_prompt_date
  ON coach_prompt_metrics (prompt_id, period_date DESC);
