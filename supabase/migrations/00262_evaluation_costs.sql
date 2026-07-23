-- Migration: 00262_evaluation_costs.sql
-- Description: Create ai_evaluation_costs and budget tables

CREATE TABLE IF NOT EXISTS ai_evaluation_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    job_id UUID NOT NULL,
    provider TEXT NOT NULL,
    model_code TEXT NOT NULL,
    input_tokens INT NOT NULL DEFAULT 0,
    output_tokens INT NOT NULL DEFAULT 0,
    estimated_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_evaluation_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_budget_usd NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    monthly_budget_usd NUMERIC(10, 2) NOT NULL DEFAULT 3000.00,
    current_daily_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.0,
    current_monthly_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.0,
    last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_eval_costs_student ON ai_evaluation_costs(student_id);
