-- Migration: 01002_revision_recommendations.sql
-- Description: Revision Recommendations table for Sprint 2.10

CREATE TABLE IF NOT EXISTS revision_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(255) NOT NULL,
  skill VARCHAR(100) NOT NULL,
  recommendation TEXT NOT NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'HIGH',
  readiness_impact NUMERIC(5, 2) NOT NULL DEFAULT 2.0,
  source_context VARCHAR(100) NOT NULL DEFAULT 'AI_EVALUATION',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_revision_recs_student ON revision_recommendations(student_id, status);

-- RLS
ALTER TABLE revision_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY revision_recommendations_isolation ON revision_recommendations
  USING (student_id IS NOT NULL);
