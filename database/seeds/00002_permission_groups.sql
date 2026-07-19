-- Seed default permission groups (repeatable & idempotent)
INSERT INTO permission_groups (name, description) VALUES
  ('identity:profile', 'Manages users profiles and contact definitions.'),
  ('auth:session', 'Manages authentication sessions lifecycle.'),
  ('security:lock', 'Enforces security lockouts and audit checks.')
ON CONFLICT (name) DO NOTHING;
