-- Migration: 00203_curriculum_indexes.sql
-- Create database indexes and unique constraints for the Curriculum & Programme Domain

-- 1. Create standard search performance indexes
CREATE INDEX idx_curricula_code ON curricula(code);
CREATE INDEX idx_curricula_slug ON curricula(slug);
CREATE INDEX idx_curriculum_versions_curriculum_id ON curriculum_versions(curriculum_id);
CREATE INDEX idx_programmes_exam_product_id ON programmes(exam_product_id);
CREATE INDEX idx_programmes_code ON programmes(code);
CREATE INDEX idx_programmes_slug ON programmes(slug);
CREATE INDEX idx_programme_versions_programme_id ON programme_versions(programme_id);
CREATE INDEX idx_courses_programme_version_id ON courses(programme_version_id);
CREATE INDEX idx_subjects_course_id ON subjects(course_id);
CREATE INDEX idx_modules_subject_id ON modules(subject_id);
CREATE INDEX idx_competencies_module_id ON competencies(module_id);
CREATE INDEX idx_learning_objectives_competency_id ON learning_objectives(competency_id);
CREATE INDEX idx_learning_outcomes_learning_objective_id ON learning_outcomes(learning_objective_id);
CREATE INDEX idx_prerequisites_version_id ON curriculum_prerequisites(curriculum_version_id);
CREATE INDEX idx_prerequisites_source ON curriculum_prerequisites(source_kind, source_id);
CREATE INDEX idx_prerequisites_target ON curriculum_prerequisites(target_kind, target_id);
CREATE INDEX idx_metadata_version_id ON curriculum_metadata(curriculum_version_id);

-- 2. Enforce only one PUBLISHED version per Curriculum and Programme at a time
CREATE UNIQUE INDEX idx_single_published_curriculum_version ON curriculum_versions(curriculum_id) WHERE (status = 'PUBLISHED' AND deleted_at IS NULL);
CREATE UNIQUE INDEX idx_single_published_programme_version ON programme_versions(programme_id) WHERE (status = 'PUBLISHED' AND deleted_at IS NULL);

-- 3. Enforce display order uniqueness per parent container
CREATE UNIQUE INDEX idx_unique_course_order ON courses(programme_version_id, display_order) WHERE (deleted_at IS NULL);
CREATE UNIQUE INDEX idx_unique_subject_order ON subjects(course_id, display_order) WHERE (deleted_at IS NULL);
CREATE UNIQUE INDEX idx_unique_module_order ON modules(subject_id, display_order) WHERE (deleted_at IS NULL);
CREATE UNIQUE INDEX idx_unique_competency_order ON competencies(module_id, display_order) WHERE (deleted_at IS NULL);
CREATE UNIQUE INDEX idx_unique_objective_order ON learning_objectives(competency_id, display_order) WHERE (deleted_at IS NULL);
CREATE UNIQUE INDEX idx_unique_outcome_order ON learning_outcomes(learning_objective_id, display_order) WHERE (deleted_at IS NULL);
