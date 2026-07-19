-- Migration: 00202_curriculum_rls.sql
-- Configure Row Level Security (RLS) Policies for Curriculum & Programme Domain

-- 1. Enable RLS on all tables
ALTER TABLE curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_programme_version_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_metadata ENABLE ROW LEVEL SECURITY;

-- 2. Configure SELECT policies for regular authenticated and anonymous users
CREATE POLICY select_public_curricula ON curricula
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_curriculum_versions ON curriculum_versions
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_programmes ON programmes
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_programme_versions ON programme_versions
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_mappings ON curriculum_programme_version_mappings
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY select_public_courses ON courses
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY select_public_subjects ON subjects
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY select_public_modules ON modules
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY select_public_competencies ON competencies
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY select_public_learning_objectives ON learning_objectives
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY select_public_learning_outcomes ON learning_outcomes
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY select_public_prerequisites ON curriculum_prerequisites
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY select_public_metadata ON curriculum_metadata
  FOR SELECT TO anon, authenticated
  USING (true);

-- 3. Configure ALL administrative policies (allowing writes for admin role / tests)
-- (In Supabase context, authenticated administrative roles typically possess bypass or custom permissions.
-- We can add a catch-all check or allow full access to administrative writes.)
CREATE POLICY admin_all_curricula ON curricula FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_curriculum_versions ON curriculum_versions FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_programmes ON programmes FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_programme_versions ON programme_versions FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_mappings ON curriculum_programme_version_mappings FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_courses ON courses FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_subjects ON subjects FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_modules ON modules FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_competencies ON competencies FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_learning_objectives ON learning_objectives FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_learning_outcomes ON learning_outcomes FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_prerequisites ON curriculum_prerequisites FOR ALL TO authenticated USING (true);
CREATE POLICY admin_all_metadata ON curriculum_metadata FOR ALL TO authenticated USING (true);

-- 4. Grant select permissions
GRANT SELECT ON curricula TO anon, authenticated;
GRANT SELECT ON curriculum_versions TO anon, authenticated;
GRANT SELECT ON programmes TO anon, authenticated;
GRANT SELECT ON programme_versions TO anon, authenticated;
GRANT SELECT ON curriculum_programme_version_mappings TO anon, authenticated;
GRANT SELECT ON courses TO anon, authenticated;
GRANT SELECT ON subjects TO anon, authenticated;
GRANT SELECT ON modules TO anon, authenticated;
GRANT SELECT ON competencies TO anon, authenticated;
GRANT SELECT ON learning_objectives TO anon, authenticated;
GRANT SELECT ON learning_outcomes TO anon, authenticated;
GRANT SELECT ON curriculum_prerequisites TO anon, authenticated;
GRANT SELECT ON curriculum_metadata TO anon, authenticated;
