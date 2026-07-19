-- Performance indexes for Question Bank Domain

-- B-Tree indexes for standard lookups
CREATE INDEX IF NOT EXISTS idx_questions_exam_product_id ON questions (exam_product_id);
CREATE INDEX IF NOT EXISTS idx_questions_curriculum_module_id ON questions (curriculum_module_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions (status);

CREATE INDEX IF NOT EXISTS idx_question_versions_question_id ON question_versions (question_id);
CREATE INDEX IF NOT EXISTS idx_question_versions_status ON question_versions (status);

CREATE INDEX IF NOT EXISTS idx_question_translations_version ON question_translations (question_version_id);
CREATE INDEX IF NOT EXISTS idx_question_media_version ON question_media (question_version_id);
CREATE INDEX IF NOT EXISTS idx_answer_options_version ON answer_options (question_version_id);
CREATE INDEX IF NOT EXISTS idx_solutions_version ON solutions (question_version_id);
CREATE INDEX IF NOT EXISTS idx_rubrics_version ON rubrics (question_version_id);

CREATE INDEX IF NOT EXISTS idx_question_blueprint_mappings_blueprint ON question_blueprint_mappings (blueprint_code);
CREATE INDEX IF NOT EXISTS idx_question_dependencies_parent ON question_dependencies (parent_question_id);
CREATE INDEX IF NOT EXISTS idx_question_dependencies_child ON question_dependencies (child_question_id);

CREATE INDEX IF NOT EXISTS idx_question_reviews_question ON question_reviews (question_id);
CREATE INDEX IF NOT EXISTS idx_question_workflow_history_question ON question_workflow_history (question_id);

-- GIN index for payload queries and JSON validation search
CREATE INDEX IF NOT EXISTS idx_question_versions_payload_gin ON question_versions USING gin (payload);
