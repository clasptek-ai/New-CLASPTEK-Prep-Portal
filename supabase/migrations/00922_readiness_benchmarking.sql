-- =============================================================
-- Sprint 2.9 Addendum — Institutional Benchmarking Schema
-- Migration: 00922_readiness_benchmarking.sql
-- =============================================================

-- ─── institutional_benchmarks ───────────────────────────────
CREATE TABLE IF NOT EXISTS institutional_benchmarks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  exam_profile_code     TEXT NOT NULL,
  avg_readiness_score   NUMERIC(5,2) NOT NULL,
  total_student_count   INTEGER NOT NULL,
  readiness_distribution JSONB NOT NULL DEFAULT '{}',
  success_forecast      JSONB NOT NULL DEFAULT '{}',
  measured_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  created_by            UUID NOT NULL,
  updated_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cohort_benchmarks ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS cohort_benchmarks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  benchmark_id          UUID NOT NULL REFERENCES institutional_benchmarks(id) ON DELETE CASCADE,
  cohort_code           TEXT NOT NULL,
  avg_readiness_score   NUMERIC(5,2) NOT NULL,
  percentile_rank       NUMERIC(5,2) NOT NULL,
  peer_cohort_rank      TEXT,
  expected_rank         TEXT,
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  created_by            UUID NOT NULL,
  updated_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── instructor_benchmarks ───────────────────────────────────
CREATE TABLE IF NOT EXISTS instructor_benchmarks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  benchmark_id          UUID NOT NULL REFERENCES institutional_benchmarks(id) ON DELETE CASCADE,
  instructor_id         UUID NOT NULL,
  avg_readiness_score   NUMERIC(5,2) NOT NULL,
  total_learner_count   INTEGER NOT NULL,
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  created_by            UUID NOT NULL,
  updated_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── learning_pathway_benchmarks ─────────────────────────────
CREATE TABLE IF NOT EXISTS learning_pathway_benchmarks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  benchmark_id          UUID NOT NULL REFERENCES institutional_benchmarks(id) ON DELETE CASCADE,
  pathway_code          TEXT NOT NULL,
  avg_readiness_score   NUMERIC(5,2) NOT NULL,
  velocity_slope        NUMERIC(6,3) NOT NULL,
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  created_by            UUID NOT NULL,
  updated_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Updated-at triggers ─────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_institutional_benchmarks_updated_at'
  ) THEN
    CREATE TRIGGER trg_institutional_benchmarks_updated_at
      BEFORE UPDATE ON institutional_benchmarks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cohort_benchmarks_updated_at'
  ) THEN
    CREATE TRIGGER trg_cohort_benchmarks_updated_at
      BEFORE UPDATE ON cohort_benchmarks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_instructor_benchmarks_updated_at'
  ) THEN
    CREATE TRIGGER trg_instructor_benchmarks_updated_at
      BEFORE UPDATE ON instructor_benchmarks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_learning_pathway_benchmarks_updated_at'
  ) THEN
    CREATE TRIGGER trg_learning_pathway_benchmarks_updated_at
      BEFORE UPDATE ON learning_pathway_benchmarks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ─── Row Level Security (RLS) ────────────────────────────────
ALTER TABLE institutional_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_pathway_benchmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_inst_bench_policy ON institutional_benchmarks;
DROP POLICY IF EXISTS insert_inst_bench_policy ON institutional_benchmarks;
DROP POLICY IF EXISTS update_inst_bench_policy ON institutional_benchmarks;
DROP POLICY IF EXISTS select_cohort_bench_policy ON cohort_benchmarks;
DROP POLICY IF EXISTS insert_cohort_bench_policy ON cohort_benchmarks;
DROP POLICY IF EXISTS update_cohort_bench_policy ON cohort_benchmarks;
DROP POLICY IF EXISTS select_instructor_bench_policy ON instructor_benchmarks;
DROP POLICY IF EXISTS insert_instructor_bench_policy ON instructor_benchmarks;
DROP POLICY IF EXISTS update_instructor_bench_policy ON instructor_benchmarks;
DROP POLICY IF EXISTS select_pathway_bench_policy ON learning_pathway_benchmarks;
DROP POLICY IF EXISTS insert_pathway_bench_policy ON learning_pathway_benchmarks;
DROP POLICY IF EXISTS update_pathway_bench_policy ON learning_pathway_benchmarks;

CREATE POLICY institutional_benchmarks_all ON institutional_benchmarks FOR ALL USING (true);
CREATE POLICY cohort_benchmarks_all ON cohort_benchmarks FOR ALL USING (true);
CREATE POLICY instructor_benchmarks_all ON instructor_benchmarks FOR ALL USING (true);
CREATE POLICY learning_pathway_benchmarks_all ON learning_pathway_benchmarks FOR ALL USING (true);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_inst_benchmarks_exam ON institutional_benchmarks(tenant_id, exam_profile_code);
CREATE INDEX IF NOT EXISTS idx_cohort_benchmarks_code ON cohort_benchmarks(tenant_id, cohort_code);
CREATE INDEX IF NOT EXISTS idx_instructor_benchmarks_inst ON instructor_benchmarks(tenant_id, instructor_id);
CREATE INDEX IF NOT EXISTS idx_pathway_benchmarks_code ON learning_pathway_benchmarks(tenant_id, pathway_code);
