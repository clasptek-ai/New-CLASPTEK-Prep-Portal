-- Seed platform feature flags into platform_metadata (repeatable & idempotent)
INSERT INTO platform_metadata (key, value, category, description) VALUES
  ('enable_mfa', 'false', 'flag_production', 'Globally enable or disable multi-factor authentication (MFA).'),
  ('enable_registration', 'true', 'flag_production', 'Controls whether new public user registration endpoints are open.'),
  ('enable_beta_theme', 'false', 'flag_beta', 'Toggles new glassmorphic administration theme layers.'),
  ('enable_experimental_ai', 'false', 'flag_experimental', 'Toggles access to early experimental AI grading models.'),
  ('deprecated_old_logout', 'false', 'flag_deprecated', 'Determines if old logout handler redirect logic is bypassed.')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    category = EXCLUDED.category,
    description = EXCLUDED.description;
