-- Migration: 01001_learning_tasks.sql
-- Description: Learning Tasks & Completed Tasks tables for Sprint 2.10

CREATE TABLE IF NOT EXISTS learning_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_plan_id UUID NOT NULL REFERENCES daily_learning_plans(id) ON DELETE CASCADE,
  lesson_id VARCHAR(255) NOT NULL,
  task_type VARCHAR(50) NOT NULL DEFAULT 'LESSON',
  priority VARCHAR(50) NOT NULL DEFAULT 'HIGH',
  estimated_minutes INT NOT NULL DEFAULT 30,
  expected_readiness_gain NUMERIC(5, 2) NOT NULL DEFAULT 1.5,
  completion_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS completed_learning_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES learning_tasks(id) ON DELETE CASCADE,
  student_id VARCHAR(255) NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actual_minutes_spent INT NOT NULL DEFAULT 30,
  readiness_gained NUMERIC(5, 2) NOT NULL DEFAULT 1.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_learning_tasks_daily ON learning_tasks(daily_plan_id, completion_status);
CREATE INDEX IF NOT EXISTS idx_completed_tasks_student ON completed_learning_tasks(student_id);

-- RLS
ALTER TABLE learning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_learning_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_tasks_isolation ON learning_tasks
  USING (daily_plan_id IN (
    SELECT dp.id FROM daily_learning_plans dp
    JOIN weekly_learning_plans wp ON dp.weekly_plan_id = wp.id
    JOIN learning_plans lp ON wp.plan_id = lp.id
    WHERE lp.tenant_id = '00000000-0000-0000-0000-000000000000'::uuid
  ));

CREATE POLICY completed_learning_tasks_isolation ON completed_learning_tasks
  USING (student_id IS NOT NULL);
