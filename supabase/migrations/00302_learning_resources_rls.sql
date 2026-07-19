-- Migration: 00302_learning_resources_rls.sql
-- Enable Row Level Security (RLS) policies and grants for the Lessons & Learning Resources Domain

-- 1. Enable RLS on all tables
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resource_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_links ENABLE ROW LEVEL SECURITY;

-- 2. Configure SELECT policies for regular authenticated and anonymous users
CREATE POLICY select_public_lessons ON lessons
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_lesson_versions ON lesson_versions
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_content_blocks ON content_blocks
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY select_public_learning_resources ON learning_resources
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_learning_resource_versions ON learning_resource_versions
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_media_assets ON media_assets
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY select_public_attachments ON resource_attachments
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY select_public_tags ON resource_tags
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY select_public_metadata ON resource_metadata
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY select_public_transcripts ON resource_transcripts
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY select_public_captions ON resource_captions
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY select_public_downloads ON resource_downloads
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY select_public_links ON resource_links
  FOR SELECT TO anon, authenticated
  USING (true);

-- 3. Configure ALL administrative policies (allowing writes for admin role / tests)
CREATE POLICY admin_all_lessons ON lessons FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_lesson_versions ON lesson_versions FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_content_blocks ON content_blocks FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_learning_resources ON learning_resources FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_learning_resource_versions ON learning_resource_versions FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_media_assets ON media_assets FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_attachments ON resource_attachments FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_tags ON resource_tags FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_metadata ON resource_metadata FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_transcripts ON resource_transcripts FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_captions ON resource_captions FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_downloads ON resource_downloads FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_links ON resource_links FOR ALL TO authenticated USING (true);

-- 4. Grant select permissions
GRANT SELECT ON lessons TO anon, authenticated;
GRANT SELECT ON lesson_versions TO anon, authenticated;
GRANT SELECT ON content_blocks TO anon, authenticated;
GRANT SELECT ON learning_resources TO anon, authenticated;
GRANT SELECT ON learning_resource_versions TO anon, authenticated;
GRANT SELECT ON media_assets TO anon, authenticated;
GRANT SELECT ON resource_attachments TO anon, authenticated;
GRANT SELECT ON resource_tags TO anon, authenticated;
GRANT SELECT ON resource_metadata TO anon, authenticated;
GRANT SELECT ON resource_transcripts TO anon, authenticated;
GRANT SELECT ON resource_captions TO anon, authenticated;
GRANT SELECT ON resource_downloads TO anon, authenticated;
GRANT SELECT ON resource_links TO anon, authenticated;
