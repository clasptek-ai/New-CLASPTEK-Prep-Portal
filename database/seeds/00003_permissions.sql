-- Seed default permission items (repeatable & idempotent)
INSERT INTO permissions (permission_group_id, code, description) VALUES
  ((SELECT id FROM permission_groups WHERE name = 'identity:profile'), 'identity:profile:read', 'Read user profiles details'),
  ((SELECT id FROM permission_groups WHERE name = 'identity:profile'), 'identity:profile:write', 'Modify user profiles details'),
  ((SELECT id FROM permission_groups WHERE name = 'identity:profile'), 'identity:profile:archive', 'Archive user profile entry'),
  ((SELECT id FROM permission_groups WHERE name = 'identity:profile'), 'identity:profile:restore', 'Restore user profile entry'),
  ((SELECT id FROM permission_groups WHERE name = 'auth:session'), 'auth:session:read', 'View active login sessions'),
  ((SELECT id FROM permission_groups WHERE name = 'auth:session'), 'auth:session:write', 'Revoke login sessions'),
  ((SELECT id FROM permission_groups WHERE name = 'security:lock'), 'security:lock:write', 'Unlock or lock user profiles'),
  ((SELECT id FROM permission_groups WHERE name = 'security:lock'), 'security:lock:read', 'Read profile lock and failed counts status')
ON CONFLICT (code) DO NOTHING;
