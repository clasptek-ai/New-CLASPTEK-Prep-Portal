-- Migration: 00260_evaluation_queues.sql
-- Description: Create evaluation_job_queues table

CREATE TABLE IF NOT EXISTS evaluation_job_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    student_id UUID NOT NULL,
    priority INT NOT NULL DEFAULT 5, -- 1=High (Mock), 5=Normal (Practice), 10=Low
    source TEXT NOT NULL, -- 'ASSESSMENT' | 'PRACTICE' | 'MOCK'
    status TEXT NOT NULL DEFAULT 'QUEUED',
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eval_job_queue_status ON evaluation_job_queues(status);
CREATE INDEX IF NOT EXISTS idx_eval_job_queue_priority ON evaluation_job_queues(priority);
