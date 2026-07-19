-- Database Views for Canonical Exam Product Domain V3
-- Milestone 1 to 5 Views Configuration

-- 1. Exam Products & Versions View
CREATE VIEW vw_exam_products AS
SELECT
  p.id AS product_id,
  p.code AS product_code,
  p.slug AS product_slug,
  p.name AS product_name,
  p.product_family,
  p.status AS product_status,
  v.id AS version_id,
  v.version_no,
  v.status AS version_status,
  v.name AS version_name,
  v.duration_minutes,
  v.exam_type
FROM exam_products p
LEFT JOIN exam_product_versions v ON p.id = v.exam_product_id AND v.deleted_at IS NULL
WHERE p.deleted_at IS NULL;

-- 2. Skill Hierarchy View
CREATE VIEW vw_skill_hierarchy AS
WITH RECURSIVE skill_tree AS (
  SELECT
    r.id AS skill_revision_id,
    r.skill_id,
    r.skill_framework_version_id,
    r.parent_skill_revision_id,
    r.name AS skill_name,
    r.category,
    r.domain,
    r.is_leaf_skill,
    1 AS depth,
    ARRAY[r.id::text] AS path
  FROM skill_revisions r
  WHERE r.parent_skill_revision_id IS NULL AND r.deleted_at IS NULL
  UNION ALL
  SELECT
    child.id AS skill_revision_id,
    child.skill_id,
    child.skill_framework_version_id,
    child.parent_skill_revision_id,
    child.name AS skill_name,
    child.category,
    child.domain,
    child.is_leaf_skill,
    parent.depth + 1 AS depth,
    parent.path || child.id::text AS path
  FROM skill_revisions child
  JOIN skill_tree parent ON child.parent_skill_revision_id = parent.skill_revision_id
  WHERE child.deleted_at IS NULL
)
SELECT * FROM skill_tree;

-- 3. Learning Paths View
CREATE VIEW vw_learning_paths AS
SELECT
  path.id AS path_id,
  path.learning_framework_id,
  path.code AS path_code,
  path.name AS path_name,
  path.path_type,
  node.id AS node_id,
  node.sequence_no,
  node.node_type,
  node.estimated_learning_minutes,
  rev.name AS skill_name,
  lvl.name AS level_name
FROM learning_paths path
LEFT JOIN learning_path_nodes node ON path.id = node.learning_path_id AND node.deleted_at IS NULL
LEFT JOIN skill_revisions rev ON node.skill_revision_id = rev.id AND rev.deleted_at IS NULL
LEFT JOIN skill_levels lvl ON node.skill_level_id = lvl.id AND lvl.deleted_at IS NULL
WHERE path.deleted_at IS NULL;

-- 4. Assessment Blueprints View
CREATE VIEW vw_assessment_blueprints AS
SELECT
  bp.id AS blueprint_id,
  bp.code AS blueprint_code,
  bp.name AS blueprint_name,
  comp.name AS component_name,
  item.id AS item_id,
  item.code AS item_code,
  item.name AS item_name,
  type.name AS item_type_name,
  item.target_item_count,
  item.weight_percentage
FROM assessment_blueprints bp
JOIN official_exam_components comp ON bp.official_exam_component_id = comp.id
LEFT JOIN assessment_blueprint_items item ON bp.id = item.assessment_blueprint_id AND item.deleted_at IS NULL
LEFT JOIN assessment_item_types type ON item.assessment_item_type_id = type.id AND type.deleted_at IS NULL
WHERE bp.deleted_at IS NULL;
