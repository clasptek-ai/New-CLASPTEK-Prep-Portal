-- =============================================================
-- Sprint 2.8 Addendum — Benchmark Dataset & Regression Schema
-- Migration: 00821_benchmark_dataset.sql
-- =============================================================

-- ─── benchmark_datasets ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS benchmark_datasets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL,
  name              TEXT NOT NULL,
  description       TEXT,
  question_type     TEXT NOT NULL,
  exam_context      TEXT,
  sample_count      INTEGER NOT NULL DEFAULT 0,
  is_locked         BOOLEAN NOT NULL DEFAULT FALSE,
  locked_at         TIMESTAMPTZ,
  locked_by         UUID,
  lock_hash         TEXT,   -- SHA-256 hash of dataset contents for immutability proof
  version           TEXT NOT NULL DEFAULT '1.0.0',
  status            TEXT NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT','ACTIVE','DEPRECATED','ARCHIVED')),
  dataset_metadata  JSONB NOT NULL DEFAULT '{}',
  created_by        UUID NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── benchmark_dataset_items ─────────────────────────────────
-- Individual question-answer pairs within a dataset (immutable once dataset locked)

CREATE TABLE IF NOT EXISTS benchmark_dataset_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  dataset_id      UUID NOT NULL REFERENCES benchmark_datasets(id) ON DELETE CASCADE,
  item_index      INTEGER NOT NULL,
  submission_text TEXT NOT NULL,
  question_text   TEXT,
  question_type   TEXT NOT NULL,
  human_score     NUMERIC(5,2) NOT NULL,
  human_band      TEXT,
  rubric_scores   JSONB NOT NULL DEFAULT '{}',
  item_metadata   JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── benchmark_runs ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS benchmark_runs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  dataset_id            UUID NOT NULL REFERENCES benchmark_datasets(id),
  experiment_id         UUID REFERENCES prompt_experiments(id),
  prompt_version_id     UUID,
  rubric_version        TEXT,
  model_version         TEXT,
  model_code            TEXT,
  provider              TEXT,
  trigger_type          TEXT NOT NULL
                        CHECK (trigger_type IN (
                          'PROMPT_CHANGE','RUBRIC_CHANGE','MODEL_CHANGE',
                          'SCORING_CHANGE','PIPELINE_CHANGE','MANUAL','SCHEDULED'
                        )),
  status                TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','RUNNING','COMPLETED','FAILED','CANCELLED')),
  total_items           INTEGER NOT NULL DEFAULT 0,
  processed_items       INTEGER NOT NULL DEFAULT 0,
  failed_items          INTEGER NOT NULL DEFAULT 0,
  -- Aggregate metrics (populated on completion)
  agreement_rate        NUMERIC(5,4),
  calibration_accuracy  NUMERIC(5,4),
  avg_score_difference  NUMERIC(5,2),
  false_positive_rate   NUMERIC(5,4),
  false_negative_rate   NUMERIC(5,4),
  avg_latency_ms        NUMERIC(8,2),
  total_cost_usd        NUMERIC(10,4),
  error_message         TEXT,
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  created_by            UUID NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── benchmark_results ───────────────────────────────────────
-- One result row per benchmark item per run (immutable after run completes)

CREATE TABLE IF NOT EXISTS benchmark_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  run_id                UUID NOT NULL REFERENCES benchmark_runs(id) ON DELETE CASCADE,
  dataset_item_id       UUID NOT NULL REFERENCES benchmark_dataset_items(id),
  ai_score              NUMERIC(5,2),
  ai_band               TEXT,
  human_score           NUMERIC(5,2) NOT NULL,
  score_difference      NUMERIC(5,2),
  agrees_with_human     BOOLEAN,
  confidence            NUMERIC(4,3),
  latency_ms            INTEGER,
  cost_usd              NUMERIC(10,6),
  token_count           INTEGER,
  rubric_scores         JSONB NOT NULL DEFAULT '{}',
  is_false_positive     BOOLEAN,
  is_false_negative     BOOLEAN,
  evaluation_notes      TEXT,
  evaluated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── benchmark_regressions ───────────────────────────────────

CREATE TABLE IF NOT EXISTS benchmark_regressions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL,
  run_id                  UUID NOT NULL REFERENCES benchmark_runs(id) ON DELETE CASCADE,
  baseline_run_id         UUID REFERENCES benchmark_runs(id),
  regression_type         TEXT NOT NULL
                          CHECK (regression_type IN (
                            'SCORE_DRIFT','CALIBRATION_DRIFT','AGREEMENT_DEGRADATION',
                            'CONFIDENCE_DEGRADATION','FALSE_POSITIVE_INCREASE',
                            'FALSE_NEGATIVE_INCREASE','LATENCY_REGRESSION','COST_REGRESSION'
                          )),
  severity                TEXT NOT NULL
                          CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  current_value           NUMERIC(10,4) NOT NULL,
  baseline_value          NUMERIC(10,4),
  threshold_value         NUMERIC(10,4),
  delta                   NUMERIC(10,4),
  delta_percent           NUMERIC(6,2),
  description             TEXT,
  is_resolved             BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at             TIMESTAMPTZ,
  resolved_by             UUID,
  resolution_notes        TEXT,
  detected_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── deployment_decisions ────────────────────────────────────

CREATE TABLE IF NOT EXISTS deployment_decisions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  run_id                UUID NOT NULL REFERENCES benchmark_runs(id),
  experiment_id         UUID REFERENCES prompt_experiments(id),
  verdict               TEXT NOT NULL
                        CHECK (verdict IN ('APPROVED','REJECTED','NEEDS_REVIEW')),
  agreement_rate        NUMERIC(5,4),
  calibration_accuracy  NUMERIC(5,4),
  regression_count      INTEGER NOT NULL DEFAULT 0,
  critical_regressions  INTEGER NOT NULL DEFAULT 0,
  decision_reason       TEXT NOT NULL,
  thresholds_applied    JSONB NOT NULL DEFAULT '{}',
  decided_by            TEXT NOT NULL DEFAULT 'SYSTEM',
  decided_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by           UUID,
  reviewed_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Updated-at triggers ─────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_benchmark_datasets_updated_at'
  ) THEN
    CREATE TRIGGER trg_benchmark_datasets_updated_at
      BEFORE UPDATE ON benchmark_datasets
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_benchmark_runs_updated_at'
  ) THEN
    CREATE TRIGGER trg_benchmark_runs_updated_at
      BEFORE UPDATE ON benchmark_runs
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_benchmark_regressions_updated_at'
  ) THEN
    CREATE TRIGGER trg_benchmark_regressions_updated_at
      BEFORE UPDATE ON benchmark_regressions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_deployment_decisions_updated_at'
  ) THEN
    CREATE TRIGGER trg_deployment_decisions_updated_at
      BEFORE UPDATE ON deployment_decisions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ─── RLS ─────────────────────────────────────────────────────

ALTER TABLE benchmark_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_dataset_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_regressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "benchmark_datasets_tenant_read" ON benchmark_datasets;
DROP POLICY IF EXISTS "benchmark_datasets_admin_write" ON benchmark_datasets;
DROP POLICY IF EXISTS "benchmark_dataset_items_tenant_read" ON benchmark_dataset_items;
DROP POLICY IF EXISTS "benchmark_dataset_items_admin_write" ON benchmark_dataset_items;
DROP POLICY IF EXISTS "benchmark_runs_tenant_read" ON benchmark_runs;
DROP POLICY IF EXISTS "benchmark_runs_admin_write" ON benchmark_runs;
DROP POLICY IF EXISTS "benchmark_results_tenant_read" ON benchmark_results;
DROP POLICY IF EXISTS "benchmark_results_admin_write" ON benchmark_results;
DROP POLICY IF EXISTS "benchmark_regressions_tenant_read" ON benchmark_regressions;
DROP POLICY IF EXISTS "benchmark_regressions_admin_write" ON benchmark_regressions;
DROP POLICY IF EXISTS "deployment_decisions_tenant_read" ON deployment_decisions;
DROP POLICY IF EXISTS "deployment_decisions_admin_write" ON deployment_decisions;

CREATE POLICY benchmark_datasets_all ON benchmark_datasets FOR ALL USING (true);
CREATE POLICY benchmark_dataset_items_all ON benchmark_dataset_items FOR ALL USING (true);
CREATE POLICY benchmark_runs_all ON benchmark_runs FOR ALL USING (true);
CREATE POLICY benchmark_results_all ON benchmark_results FOR ALL USING (true);
CREATE POLICY benchmark_regressions_all ON benchmark_regressions FOR ALL USING (true);
CREATE POLICY deployment_decisions_all ON deployment_decisions FOR ALL USING (true);
