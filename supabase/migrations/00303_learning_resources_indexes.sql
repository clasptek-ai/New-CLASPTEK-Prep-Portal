-- Migration: 00303_learning_resources_indexes.sql
-- Create database indexes and unique constraints for the Lessons & Learning Resources Domain

-- 1. Create standard search performance indexes
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_code ON lessons(code);
CREATE INDEX idx_lesson_versions_lesson_id ON lesson_versions(lesson_id);
CREATE INDEX idx_content_blocks_lesson_version_id ON content_blocks(lesson_version_id);
CREATE INDEX idx_learning_resources_lesson_id ON learning_resources(lesson_id);
CREATE INDEX idx_learning_resources_code ON learning_resources(code);
CREATE INDEX idx_learning_resource_versions_learning_resource_id ON learning_resource_versions(learning_resource_id);
CREATE INDEX idx_media_assets_resource_version_id ON media_assets(resource_version_id);
CREATE INDEX idx_resource_attachments_resource_version_id ON resource_attachments(resource_version_id);
CREATE INDEX idx_resource_transcripts_resource_version_id ON resource_transcripts(resource_version_id);
CREATE INDEX idx_resource_captions_resource_version_id ON resource_captions(resource_version_id);
CREATE INDEX idx_resource_downloads_resource_version_id ON resource_downloads(resource_version_id);
CREATE INDEX idx_resource_links_resource_version_id ON resource_links(resource_version_id);

-- 2. Enforce only one PUBLISHED version per Lesson and Learning Resource at a time
CREATE UNIQUE INDEX idx_single_published_lesson_version ON lesson_versions(lesson_id) WHERE (status = 'PUBLISHED' AND deleted_at IS NULL);
CREATE UNIQUE INDEX idx_single_published_resource_version ON learning_resource_versions(learning_resource_id) WHERE (status = 'PUBLISHED' AND deleted_at IS NULL);

-- 3. Enforce display order uniqueness per parent scope
CREATE UNIQUE INDEX idx_unique_lesson_order ON lessons(module_id, display_order) WHERE (deleted_at IS NULL);
CREATE UNIQUE INDEX idx_unique_resource_order ON learning_resources(lesson_id, display_order) WHERE (deleted_at IS NULL);
CREATE UNIQUE INDEX idx_unique_content_block_order ON content_blocks(lesson_version_id, display_order);
