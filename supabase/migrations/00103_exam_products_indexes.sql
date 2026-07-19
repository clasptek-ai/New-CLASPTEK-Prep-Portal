-- Performance and Unique Indexes for Canonical Exam Product Domain V3
-- Milestone 1 to 5 Index Configuration

-- 1. Unique Indexes enforcing active business key constraints
CREATE UNIQUE INDEX uq_active_exam_product_code ON exam_products (code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_exam_product_slug ON exam_products (slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_product_version ON exam_product_versions (exam_product_id, version_no) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_official_structure ON official_exam_structures (exam_product_version_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_official_component ON official_exam_components (official_exam_structure_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_item_type ON assessment_item_types (code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_blueprint ON assessment_blueprints (exam_product_version_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_blueprint_item ON assessment_blueprint_items (assessment_blueprint_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_skill_framework ON skill_frameworks (code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_skill_framework_version ON skill_framework_versions (skill_framework_id, version_no) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_skill ON skills (skill_framework_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_skill_revision ON skill_revisions (skill_id, skill_framework_version_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_skill_level ON skill_levels (skill_framework_version_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_skill_relation ON skill_relations (skill_framework_version_id, source_skill_revision_id, target_skill_revision_id, relation_type) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_learning_framework ON learning_frameworks (exam_product_version_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_learning_path ON learning_paths (learning_framework_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_learning_node ON learning_path_nodes (learning_path_id, skill_revision_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_readiness_framework ON readiness_frameworks (exam_product_version_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_score_scheme ON exam_score_schemes (exam_product_version_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_score_scale ON exam_score_scales (exam_score_scheme_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_adaptive_profile ON adaptive_exam_profiles (exam_product_version_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_delivery_config ON exam_delivery_configurations (exam_product_version_id, code) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_active_regional_variant ON exam_regional_variants (exam_product_version_id, code) WHERE deleted_at IS NULL;

-- 2. Foreign Key performance indexes
CREATE INDEX idx_exam_products_version ON exam_products (current_version_id);
CREATE INDEX idx_exam_product_versions_prod ON exam_product_versions (exam_product_id);
CREATE INDEX idx_official_exam_structures_vers ON official_exam_structures (exam_product_version_id);
CREATE INDEX idx_official_exam_components_struct ON official_exam_components (official_exam_structure_id);
CREATE INDEX idx_official_exam_components_parent ON official_exam_components (parent_component_id);
CREATE INDEX idx_assessment_blueprints_comp ON assessment_blueprints (official_exam_component_id);
CREATE INDEX idx_assessment_blueprint_items_bp ON assessment_blueprint_items (assessment_blueprint_id);
CREATE INDEX idx_assessment_blueprint_items_type ON assessment_blueprint_items (assessment_item_type_id);
CREATE INDEX idx_assessment_blueprint_skill_mappings_item ON assessment_blueprint_skill_mappings (assessment_blueprint_item_id);
CREATE INDEX idx_assessment_blueprint_skill_mappings_rev ON assessment_blueprint_skill_mappings (skill_revision_id);
CREATE INDEX idx_skill_framework_versions_fw ON skill_framework_versions (skill_framework_id);
CREATE INDEX idx_skills_framework ON skills (skill_framework_id);
CREATE INDEX idx_skills_revision ON skills (current_revision_id);
CREATE INDEX idx_skill_revisions_skill ON skill_revisions (skill_id);
CREATE INDEX idx_skill_revisions_ver ON skill_revisions (skill_framework_version_id);
CREATE INDEX idx_skill_revisions_parent ON skill_revisions (parent_skill_revision_id);
CREATE INDEX idx_skill_levels_ver ON skill_levels (skill_framework_version_id);
CREATE INDEX idx_skill_relations_ver ON skill_relations (skill_framework_version_id);
CREATE INDEX idx_skill_relations_source ON skill_relations (source_skill_revision_id);
CREATE INDEX idx_skill_relations_target ON skill_relations (target_skill_revision_id);
CREATE INDEX idx_learning_frameworks_ver ON learning_frameworks (skill_framework_version_id);
CREATE INDEX idx_learning_paths_framework ON learning_paths (learning_framework_id);
CREATE INDEX idx_learning_paths_parent ON learning_paths (parent_path_id);
CREATE INDEX idx_learning_path_nodes_path ON learning_path_nodes (learning_path_id);
CREATE INDEX idx_readiness_frameworks_score ON readiness_frameworks (target_score_scheme_id);
CREATE INDEX idx_readiness_criteria_fw ON readiness_criteria (readiness_framework_id);
CREATE INDEX idx_diagnostic_frameworks_path ON diagnostic_frameworks (fallback_learning_path_id);
CREATE INDEX idx_diagnostic_rules_fw ON diagnostic_rules (diagnostic_framework_id);
CREATE INDEX idx_exam_score_schemes_comp ON exam_score_schemes (official_exam_component_id);
CREATE INDEX idx_exam_score_scales_scheme ON exam_score_scales (exam_score_scheme_id);
CREATE INDEX idx_adaptive_exam_profiles_comp ON adaptive_exam_profiles (official_exam_component_id);
CREATE INDEX idx_exam_delivery_configurations_ver ON exam_delivery_configurations (exam_product_version_id);
CREATE INDEX idx_exam_regional_variants_ver ON exam_regional_variants (exam_product_version_id);
CREATE INDEX idx_exam_board_metadata_ver ON exam_board_metadata (exam_product_version_id);
CREATE INDEX idx_clasptek_product_metadata_ver ON clasptek_product_metadata (exam_product_version_id);

-- 3. Status and filter lookup indexes
CREATE INDEX idx_exam_products_status ON exam_products (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_exam_product_versions_status ON exam_product_versions (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_skill_frameworks_status ON skill_frameworks (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_outbox_events_processed ON outbox_events (processed_at) WHERE processed_at IS NULL;
