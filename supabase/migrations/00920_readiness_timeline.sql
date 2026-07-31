-- =============================================================
-- Sprint 2.9 Addendum — Readiness Timeline Schema
-- Migration: 00920_readiness_timeline.sql
-- =============================================================

-- ─── readiness_timeline ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS readiness_timeline (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NULL,
  student_id  UUID NOT NULL,
  profile_id  UUID NOT NULL,
  status      TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ARCHIVED')),
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  created_by  UUID NOT NULL,
  updated_by  UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── readiness_snapshots ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS readiness_snapshots (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NULL,
  timeline_id            UUID NOT NULL REFERENCES readiness_timeline(id) ON DELETE CASCADE,
  student_id             UUID NOT NULL,
  profile_id             UUID NOT NULL,
  readiness_score        NUMERIC(5,2) NOT NULL,
  competency_mastery     JSONB NOT NULL DEFAULT '{}',
  learner_state          JSONB NOT NULL DEFAULT '{}',
  practice_statistics    JSONB NOT NULL DEFAULT '{}',
  study_streak           JSONB NOT NULL DEFAULT '{}',
  is_deleted             BOOLEAN NOT NULL DEFAULT FALSE,
  created_by             UUID NOT NULL,
  updated_by             UUID,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── timeline_trends ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_trends (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NULL,
  timeline_id         UUID NOT NULL REFERENCES readiness_timeline(id) ON DELETE CASCADE,
  student_id          UUID NOT NULL,
  trend_direction     TEXT NOT NULL CHECK (trend_direction IN ('ACCELERATING','IMPROVING','PLATEAU','DECLINING','RECOVERING')),
  learning_velocity   NUMERIC(6,3) NOT NULL,
  slope               NUMERIC(6,3) NOT NULL,
  measured_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
  created_by          UUID NOT NULL,
  updated_by          UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE readiness_timeline ADD COLUMN IF NOT EXISTS tenant_id UUID NULL;
ALTER TABLE readiness_snapshots ADD COLUMN IF NOT EXISTS tenant_id UUID NULL;
ALTER TABLE readiness_snapshots ADD COLUMN IF NOT EXISTS timeline_id UUID NULL;
ALTER TABLE readiness_snapshots ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE timeline_trends ADD COLUMN IF NOT EXISTS tenant_id UUID NULL;
ALTER TABLE timeline_trends ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── Updated-at triggers ─────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_readiness_timeline_updated_at'
  ) THEN
    CREATE TRIGGER trg_readiness_timeline_updated_at
      BEFORE UPDATE ON readiness_timeline
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_readiness_snapshots_updated_at'
  ) THEN
    CREATE TRIGGER trg_readiness_snapshots_updated_at
      BEFORE UPDATE ON readiness_snapshots
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_timeline_trends_updated_at'
  ) THEN
    CREATE TRIGGER trg_timeline_trends_updated_at
      BEFORE UPDATE ON timeline_trends
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ─── Row Level Security (RLS) ────────────────────────────────
ALTER TABLE readiness_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_trends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_timeline_policy ON readiness_timeline;
DROP POLICY IF EXISTS insert_timeline_policy ON readiness_timeline;
DROP POLICY IF EXISTS update_timeline_policy ON readiness_timeline;
DROP POLICY IF EXISTS select_snapshots_policy ON readiness_snapshots;
DROP POLICY IF EXISTS insert_snapshots_policy ON readiness_snapshots;
DROP POLICY IF EXISTS update_snapshots_policy ON readiness_snapshots;
DROP POLICY IF EXISTS select_trends_policy ON timeline_trends;
DROP POLICY IF EXISTS insert_trends_policy ON timeline_trends;
DROP POLICY IF EXISTS update_trends_policy ON timeline_trends;

CREATE POLICY readiness_timeline_all ON readiness_timeline FOR ALL USING (true);
CREATE POLICY readiness_snapshots_all ON readiness_snapshots FOR ALL USING (true);
CREATE POLICY timeline_trends_all ON timeline_trends FOR ALL USING (true);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_readiness_timeline_student ON readiness_timeline(tenant_id, student_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_timeline ON readiness_snapshots(tenant_id, timeline_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_trends_timeline ON timeline_trends(tenant_id, timeline_id, measured_at DESC);
