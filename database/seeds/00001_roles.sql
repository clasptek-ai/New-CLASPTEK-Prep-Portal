-- Seed default system roles into the database (repeatable & idempotent)
INSERT INTO roles (name, description) VALUES
  ('Super Administrator', 'Global platform owner with full access privileges to all contexts.'),
  ('Administrator', 'Academy-scoped administrator managing tenants and products.'),
  ('Instructor', 'Academic supervisor managing assignments and grading reviews.'),
  ('Student', 'Academic consumer studying curricula, practicing exercises, and taking assessments.'),
  ('Support', 'Platform operations and helpdesk coordinator.')
ON CONFLICT (name) DO NOTHING;
