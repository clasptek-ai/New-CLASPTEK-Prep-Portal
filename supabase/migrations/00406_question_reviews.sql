-- Migration: 00406_question_reviews.sql
-- Create question_reviews table

CREATE TABLE IF NOT EXISTS public.question_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_version_id UUID NOT NULL REFERENCES public.question_versions(id) ON DELETE CASCADE,
    stage VARCHAR(64) NOT NULL,
    assigned_reviewer_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL,
    CONSTRAINT chk_review_status CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT chk_review_stage CHECK (stage IN ('peer_review', 'sme_review', 'editorial_signoff'))
);

CREATE INDEX IF NOT EXISTS idx_question_reviews_version ON public.question_reviews(question_version_id);
CREATE INDEX IF NOT EXISTS idx_question_reviews_reviewer ON public.question_reviews(assigned_reviewer_id);
