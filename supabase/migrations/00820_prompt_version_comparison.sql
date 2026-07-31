-- =============================================================
-- Sprint 2.8 Addendum — Prompt Version Comparison Schema
-- Migration: 00820_prompt_version_comparison.sql
-- =============================================================

-- ─── prompt_experiments ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS prompt_experiments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  name                  TEXT NOT NULL,
  description           TEXT,
  prompt_template_id    UUID,
  baseline_version_id   UUID NOT NULL,
  candidate_version_id  UUID NOT NULL,
  rubric_version        TEXT,
  model_version         TEXT,
  question_type_target  TEXT,
  status                TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','RUNNING','COMPLETED','FAILED','CANCELLED')),
  trigger_reason        TEXT NOT NULL
                        CHECK (trigger_reason IN (
                          'PROMPT_CHANGE','RUBRIC_CHANGE','MODEL_CHANGE',
                          'SCORING_LOGIC_CHANGE','PIPELINE_CHANGE','MANUAL'
                        )),
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  created_by            UUID NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── prompt_comparisons ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS prompt_comparisons (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL,
  experiment_id             UUID NOT NULL REFERENCES prompt_experiments(id) ON DELETE CASCADE,
  submission_id             UUID NOT NULL,
  question_type             TEXT NOT NULL,
  baseline_score            NUMERIC(5,2),
  candidate_score           NUMERIC(5,2),
  score_difference          NUMERIC(5,2),
  human_score               NUMERIC(5,2),
  baseline_agrees_human     BOOLEAN,
  candidate_agrees_human    BOOLEAN,
  baseline_confidence       NUMERIC(4,3),
  candidate_confidence      NUMERIC(4,3),
  baseline_latency_ms       INTEGER,
  candidate_latency_ms      INTEGER,
  baseline_cost_usd         NUMERIC(10,6),
  candidate_cost_usd        NUMERIC(10,6),
  baseline_token_count      INTEGER,
  candidate_token_count     INTEGER,
  instructor_overrode       BOOLEAN NOT NULL DEFAULT FALSE,
  instructor_override_score NUMERIC(5,2),
  comparison_notes          TEXT,
  evaluated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── prompt_performance_metrics ──────────────────────────────

CREATE TABLE IF NOT EXISTS prompt_performance_metrics (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL,
  experiment_id             UUID NOT NULL REFERENCES prompt_experiments(id) ON DELETE CASCADE,
  prompt_version_id         UUID NOT NULL,
  rubric_version            TEXT,
  model_version             TEXT,
  question_type             TEXT,
  sample_count              INTEGER NOT NULL DEFAULT 0,
  -- Agreement metrics
  agreement_rate            NUMERIC(5,4),
  calibration_accuracy      NUMERIC(5,4),
  instructor_override_rate  NUMERIC(5,4),
  -- Score metrics
  avg_score_difference      NUMERIC(5,2),
  score_drift               NUMERIC(5,2),
  false_positive_rate       NUMERIC(5,4),
  false_negative_rate       NUMERIC(5,4),
  -- Distribution metrics
  confidence_mean           NUMERIC(5,4),
  confidence_stddev         NUMERIC(5,4),
  confidence_p10            NUMERIC(5,4),
  confidence_p90            NUMERIC(5,4),
  -- Performance metrics
  avg_latency_ms            NUMERIC(8,2),
  p95_latency_ms            NUMERIC(8,2),
  avg_cost_usd              NUMERIC(10,6),
  total_cost_usd            NUMERIC(10,6),
  avg_token_count           NUMERIC(8,2),
  -- Computed at
  computed_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Updated-at triggers ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prompt_experiments_updated_at'
  ) THEN
    CREATE TRIGGER trg_prompt_experiments_updated_at
      BEFORE UPDATE ON prompt_experiments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prompt_comparisons_updated_at'
  ) THEN
    CREATE TRIGGER trg_prompt_comparisons_updated_at
      BEFORE UPDATE ON prompt_comparisons
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prompt_performance_metrics_updated_at'
  ) THEN
    CREATE TRIGGER trg_prompt_performance_metrics_updated_at
      BEFORE UPDATE ON prompt_performance_metrics
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ─── RLS ─────────────────────────────────────────────────────

ALTER TABLE prompt_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_performance_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prompt_experiments_tenant_read" ON prompt_experiments;
DROP POLICY IF EXISTS "prompt_experiments_admin_write" ON prompt_experiments;
DROP POLICY IF EXISTS "prompt_comparisons_tenant_read" ON prompt_comparisons;
DROP POLICY IF EXISTS "prompt_comparisons_admin_write" ON prompt_comparisons;
DROP POLICY IF EXISTS "prompt_performance_metrics_tenant_read" ON prompt_performance_metrics;
DROP POLICY IF EXISTS "prompt_performance_metrics_admin_write" ON prompt_performance_metrics;

CREATE POLICY prompt_experiments_all ON prompt_experiments FOR ALL USING (true);
CREATE POLICY prompt_comparisons_all ON prompt_comparisons FOR ALL USING (true);
CREATE POLICY prompt_performance_metrics_all ON prompt_performance_metrics FOR ALL USING (true);
