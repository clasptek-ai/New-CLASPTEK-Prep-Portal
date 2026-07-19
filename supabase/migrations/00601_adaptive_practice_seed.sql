-- Migration: 00601_adaptive_practice_seed
-- Description: Seed the pluggable strategy registry (Rec 2)

INSERT INTO practice_strategy_registry (strategy_code, display_name, algorithm_version, configuration_schema, status)
VALUES
  (
    'WEAKEST_FIRST',
    'Weakest Competency First',
    '1.0.0',
    '{"type": "object", "properties": {"threshold": {"type": "number", "minimum": 0, "maximum": 100}}}'::jsonb,
    'ACTIVE'
  ),
  (
    'BALANCED',
    'Balanced Competency Coverage',
    '1.0.0',
    '{"type": "object", "properties": {"targetPercentage": {"type": "number", "minimum": 0, "maximum": 100}}}'::jsonb,
    'ACTIVE'
  ),
  (
    'BLUEPRINT',
    'Exam Blueprint Coverage',
    '1.0.0',
    '{"type": "object", "properties": {"examProductId": {"type": "string", "format": "uuid"}}}'::jsonb,
    'ACTIVE'
  ),
  (
    'DIFFICULTY_PROG',
    'Dynamic Difficulty Progression',
    '1.0.0',
    '{"type": "object", "properties": {"progressionStep": {"type": "number"}, "minConfidence": {"type": "number"}}}'::jsonb,
    'ACTIVE'
  ),
  (
    'RANDOM',
    'Random Selection Within Constraints',
    '1.0.0',
    '{"type": "object", "properties": {}}'::jsonb,
    'ACTIVE'
  )
ON CONFLICT (strategy_code) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  algorithm_version = EXCLUDED.algorithm_version,
  configuration_schema = EXCLUDED.configuration_schema,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;
