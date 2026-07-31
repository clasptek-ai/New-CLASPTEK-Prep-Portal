-- =============================================================
-- Sprint 2.9 Addendum — Prediction Stability & Scenarios Schema
-- Migration: 00921_prediction_stability.sql
-- =============================================================

-- ─── prediction_stability ────────────────────────────────────
CREATE TABLE IF NOT EXISTS prediction_stability (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL,
  student_id          UUID NOT NULL,
  profile_id          UUID NOT NULL,
  stability_score     NUMERIC(5,2) NOT NULL,
  variance            NUMERIC(6,3) NOT NULL,
  volatility_state    TEXT NOT NULL CHECK (volatility_state IN ('STABLE','IMPROVING','DECLINING','HIGHLY_VOLATILE')),
  confidence_trend    TEXT NOT NULL CHECK (confidence_trend IN ('UPWARD','STABLE','DOWNWARD')),
  is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
  created_by          UUID NOT NULL,
  updated_by          UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── stability_history ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS stability_history (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL,
  stability_id           UUID NOT NULL REFERENCES prediction_stability(id) ON DELETE CASCADE,
  stability_score        NUMERIC(5,2) NOT NULL,
  volatility_state       TEXT NOT NULL,
  measured_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted             BOOLEAN NOT NULL DEFAULT FALSE,
  created_by             UUID NOT NULL,
  updated_by             UUID,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── target_scenarios ────────────────────────────────────────
-- Persistent scenario aggregate for what-if version planning.
CREATE TABLE IF NOT EXISTS target_scenarios (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL,
  student_id             UUID NOT NULL,
  scenario_name          TEXT NOT NULL,
  is_deleted             BOOLEAN NOT NULL DEFAULT FALSE,
  created_by             UUID NOT NULL,
  updated_by             UUID,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── scenario_versions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenario_versions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL,
  scenario_id            UUID NOT NULL REFERENCES target_scenarios(id) ON DELETE CASCADE,
  version_number         INTEGER NOT NULL,
  notes                  TEXT,
  is_deleted             BOOLEAN NOT NULL DEFAULT FALSE,
  created_by             UUID NOT NULL,
  updated_by             UUID,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(scenario_id, version_number)
);

-- ─── scenario_snapshots ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenario_snapshots (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL,
  version_id             UUID NOT NULL REFERENCES scenario_versions(id) ON DELETE CASCADE,
  simulated_inputs       JSONB NOT NULL DEFAULT '{}',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── scenario_results ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenario_results (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                    UUID NOT NULL,
  version_id                   UUID NOT NULL REFERENCES scenario_versions(id) ON DELETE CASCADE,
  projected_readiness          NUMERIC(5,2) NOT NULL,
  predicted_official_score     NUMERIC(5,2) NOT NULL,
  estimated_achievement_date   TIMESTAMPTZ NOT NULL,
  goal_probability             NUMERIC(4,3) NOT NULL,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Updated-at triggers ─────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prediction_stability_updated_at'
  ) THEN
    CREATE TRIGGER trg_prediction_stability_updated_at
      BEFORE UPDATE ON prediction_stability
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_target_scenarios_updated_at'
  ) THEN
    CREATE TRIGGER trg_target_scenarios_updated_at
      BEFORE UPDATE ON target_scenarios
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_scenario_versions_updated_at'
  ) THEN
    CREATE TRIGGER trg_scenario_versions_updated_at
      BEFORE UPDATE ON scenario_versions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ─── Row Level Security (RLS) ────────────────────────────────
ALTER TABLE prediction_stability ENABLE ROW LEVEL SECURITY;
ALTER TABLE stability_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_stability_policy ON prediction_stability;
DROP POLICY IF EXISTS insert_stability_policy ON prediction_stability;
DROP POLICY IF EXISTS update_stability_policy ON prediction_stability;
DROP POLICY IF EXISTS select_scenarios_policy ON target_scenarios;
DROP POLICY IF EXISTS insert_scenarios_policy ON target_scenarios;
DROP POLICY IF EXISTS update_scenarios_policy ON target_scenarios;
DROP POLICY IF EXISTS select_versions_policy ON scenario_versions;
DROP POLICY IF EXISTS insert_versions_policy ON scenario_versions;
DROP POLICY IF EXISTS update_versions_policy ON scenario_versions;

CREATE POLICY prediction_stability_all ON prediction_stability FOR ALL USING (true);
CREATE POLICY stability_history_all ON stability_history FOR ALL USING (true);
CREATE POLICY target_scenarios_all ON target_scenarios FOR ALL USING (true);
CREATE POLICY scenario_versions_all ON scenario_versions FOR ALL USING (true);
CREATE POLICY scenario_snapshots_all ON scenario_snapshots FOR ALL USING (true);
CREATE POLICY scenario_results_all ON scenario_results FOR ALL USING (true);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_prediction_stability_student ON prediction_stability(tenant_id, student_id);
CREATE INDEX IF NOT EXISTS idx_stability_history_stability ON stability_history(tenant_id, stability_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_target_scenarios_student ON target_scenarios(tenant_id, student_id);
CREATE INDEX IF NOT EXISTS idx_scenario_versions_scenario ON scenario_versions(tenant_id, scenario_id);
