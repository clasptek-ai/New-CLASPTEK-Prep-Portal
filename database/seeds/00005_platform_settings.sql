-- Seed platform settings into platform_metadata (repeatable & idempotent)
INSERT INTO platform_metadata (key, value, category, description) VALUES
  ('platform_version', 'v0.3.0', 'environment', 'Current release version tag of the monorepo platform.'),
  ('environment_name', 'development', 'environment', 'Active deployment environment profile (development, staging, production).'),
  ('brand_name', 'Clasptek Prep Portal', 'brand', 'System branding title used in portal templates.'),
  ('brand_logo_url', '/images/logo-dark.png', 'brand', 'Path to default platform branding asset.'),
  ('default_timezone', 'UTC', 'localization', 'Fallback timezone for new profiles creation.'),
  ('default_locale', 'en', 'localization', 'Fallback locale translation code.'),
  ('min_password_length', '8', 'limits', 'Minimum password length required on user registrations.'),
  ('max_active_sessions', '5', 'limits', 'Max simultaneous active sessions allowed per account.')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    category = EXCLUDED.category,
    description = EXCLUDED.description;
