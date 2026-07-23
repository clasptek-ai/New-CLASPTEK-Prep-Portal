-- Migration: 00273_progress_statistics.sql
-- Results & Academic Progress Portal — Performance Statistics & Progress Snapshots

CREATE TABLE IF NOT EXISTS performance_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    skill_code VARCHAR(100) NOT NULL,
    latest_score NUMERIC(8,2) DEFAULT NULL,
    best_score NUMERIC(8,2) DEFAULT NULL,
    average_score NUMERIC(8,2) DEFAULT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    improvement_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_perf_stats_student_skill UNIQUE (student_id, skill_code)
);

CREATE INDEX IF NOT EXISTS idx_perf_stats_student ON performance_statistics(student_id);
CREATE INDEX IF NOT EXISTS idx_perf_stats_skill ON performance_statistics(skill_code);

CREATE TABLE IF NOT EXISTS progress_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    snapshot_date DATE NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL,
    skill_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_progress_snapshots_student_date UNIQUE (student_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_progress_snapshots_student ON progress_snapshots(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_snapshots_date ON progress_snapshots(snapshot_date DESC);
