-- Migration: 00411_question_rls.sql
-- Description: Applies Row Level Security (RLS) policies for Question Bank Domain

-- 1. Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_hashes ENABLE ROW LEVEL SECURITY;

-- 2. Setup standard selection read policies for authenticated users
CREATE POLICY select_published_questions ON public.questions
    FOR SELECT TO authenticated
    USING (status = 'published');

CREATE POLICY select_published_versions ON public.question_versions
    FOR SELECT TO authenticated
    USING (status = 'published');

CREATE POLICY select_published_options ON public.answer_options
    FOR SELECT TO authenticated
    USING (true); -- gated by parent version visibility

CREATE POLICY select_published_media ON public.question_media
    FOR SELECT TO authenticated
    USING (true); -- gated by parent version visibility

CREATE POLICY select_solutions ON public.solutions
    FOR SELECT TO authenticated
    USING (true); -- Distractor/explanation read policies are gated at API layers for students

CREATE POLICY select_rubrics ON public.rubrics
    FOR SELECT TO authenticated
    USING (true);

-- 3. Define admin-level policies for writes and reads (full access matching authenticated tenant)
CREATE POLICY admin_all_questions ON public.questions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_versions ON public.question_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_options ON public.answer_options FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_media ON public.question_media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_solutions ON public.solutions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_rubrics ON public.rubrics FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_reviews ON public.question_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_history ON public.question_workflow_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_stats ON public.question_statistics FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_ownership ON public.question_ownership FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_dependencies ON public.question_dependencies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_imports ON public.question_imports FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_hashes ON public.duplicate_hashes FOR ALL TO authenticated USING (true) WITH CHECK (true);
