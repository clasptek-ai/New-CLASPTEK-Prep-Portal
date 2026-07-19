-- Row Level Security (RLS) Policies for Canonical Exam Product Domain V3
-- Milestone 1 to 5 RLS Configuration

-- 1. Enable RLS on all tables
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_product_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_exam_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_exam_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_item_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_blueprint_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_blueprint_skill_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_framework_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_score_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_score_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_exam_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_delivery_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_regional_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_board_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE clasptek_product_metadata ENABLE ROW LEVEL SECURITY;

-- 2. Grant general read permissions to anonymous and authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- 3. Configure SELECT policies for reading published configurations
CREATE POLICY select_public_exam_products ON exam_products
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_exam_product_versions ON exam_product_versions
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_official_exam_structures ON official_exam_structures
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_official_exam_components ON official_exam_components
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_assessment_item_types ON assessment_item_types
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_assessment_blueprints ON assessment_blueprints
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_assessment_blueprint_items ON assessment_blueprint_items
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_assessment_blueprint_skill_mappings ON assessment_blueprint_skill_mappings
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_skill_frameworks ON skill_frameworks
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_skill_framework_versions ON skill_framework_versions
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY select_public_skills ON skills
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_skill_revisions ON skill_revisions
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_skill_levels ON skill_levels
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_skill_relations ON skill_relations
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_learning_frameworks ON learning_frameworks
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_learning_paths ON learning_paths
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_learning_path_nodes ON learning_path_nodes
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_readiness_frameworks ON readiness_frameworks
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_readiness_criteria ON readiness_criteria
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_diagnostic_frameworks ON diagnostic_frameworks
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_diagnostic_rules ON diagnostic_rules
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_exam_score_schemes ON exam_score_schemes
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_exam_score_scales ON exam_score_scales
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_adaptive_exam_profiles ON adaptive_exam_profiles
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_exam_delivery_configurations ON exam_delivery_configurations
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_exam_regional_variants ON exam_regional_variants
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_exam_board_metadata ON exam_board_metadata
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

CREATE POLICY select_public_clasptek_product_metadata ON clasptek_product_metadata
  FOR SELECT TO anon, authenticated
  USING (status = 'ACTIVE' AND deleted_at IS NULL);

-- Outbox events read restrictions (Only authenticated admin can read)
CREATE POLICY select_admin_outbox ON outbox_events
  FOR SELECT TO authenticated
  USING (false); -- standard users cannot read, only service_role
