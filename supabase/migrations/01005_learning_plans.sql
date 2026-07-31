-- Migration: 01000_learning_plans.sql
-- Description: Core Learning Plans tables for Sprint 2.10 Intelligent Learning Assistant

CREATE TABLE IF NOT EXISTS learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  student_id VARCHAR(255) NOT NULL,
  programme_id VARCHAR(255) NOT NULL DEFAULT 'IELTS_ACADEMIC',
  readiness_score NUMERIC(5, 2) NOT NULL DEFAULT 70.00,
  predicted_score NUMERIC(5, 2) NOT NULL DEFAULT 6.5,
  generated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_exam_date TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '60 days',
  estimated_completion TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '50 days',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE learning_plans ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

CREATE TABLE IF NOT EXISTS weekly_learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_id UUID NOT NULL REFERENCES weekly_learning_plans(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_learning_plans_student ON learning_plans(student_id, status);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_plan ON weekly_learning_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_daily_plans_weekly ON daily_learning_plans(weekly_plan_id);

-- RLS
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_learning_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_plans_tenant_isolation ON learning_plans
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY weekly_learning_plans_isolation ON weekly_learning_plans
  USING (plan_id IN (SELECT id FROM learning_plans WHERE tenant_id = '00000000-0000-0000-0000-000000000000'::uuid));

CREATE POLICY daily_learning_plans_isolation ON daily_learning_plans
  USING (weekly_plan_id IN (SELECT id FROM weekly_learning_plans WHERE plan_id IN (SELECT id FROM learning_plans WHERE tenant_id = '00000000-0000-0000-0000-000000000000'::uuid)));
