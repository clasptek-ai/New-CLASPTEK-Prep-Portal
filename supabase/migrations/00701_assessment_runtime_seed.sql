-- Migration: 00701_assessment_runtime_seed
-- Description: Seeds default assessment instances

INSERT INTO assessment_instances (id, question_sequence, timer_policy, navigation_policy, autosave_policy, metadata)
VALUES (
  'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
  '{"questions": [{"id": "q1", "versionId": "qv1"}, {"id": "q2", "versionId": "qv2"}]}',
  '{"type": "Countdown", "limitMs": 3600000}',
  '{"mode": "Free"}',
  '{"type": "Interval", "intervalMs": 10000}',
  '{"title": "Standard Practice Simulation"}'
) ON CONFLICT (id) DO NOTHING;
