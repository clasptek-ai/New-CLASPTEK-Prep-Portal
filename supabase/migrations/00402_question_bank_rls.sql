-- Row Level Security policies for Question Bank Domain

-- Enable RLS
ALTER TABLE question_schema_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_blueprint_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_workflow_history ENABLE ROW LEVEL SECURITY;

-- 1. Read policies (public reads for published items)
CREATE POLICY select_public_registry ON question_schema_registry
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_questions ON questions
    FOR SELECT TO public USING (deleted_at IS NULL);

CREATE POLICY select_public_versions ON question_versions
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_translations ON question_translations
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_media ON question_media
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_options ON answer_options
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_solutions ON solutions
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_rubrics ON rubrics
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_blueprint ON question_blueprint_mappings
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_dependencies ON question_dependencies
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_ownership ON question_ownership
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_statistics ON question_statistics
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_reviews ON question_reviews
    FOR SELECT TO public USING (true);

CREATE POLICY select_public_workflow ON question_workflow_history
    FOR SELECT TO public USING (true);

-- 2. Write policies (restricted to service-role or admin users)
CREATE POLICY write_admin_registry ON question_schema_registry
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_questions ON questions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_versions ON question_versions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_translations ON question_translations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_media ON question_media
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_options ON answer_options
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_solutions ON solutions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_rubrics ON rubrics
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_blueprint ON question_blueprint_mappings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_dependencies ON question_dependencies
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_ownership ON question_ownership
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_statistics ON question_statistics
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_reviews ON question_reviews
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY write_admin_workflow ON question_workflow_history
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
