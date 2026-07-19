-- Seed reference lists for locales, languages, countries, and timezones (repeatable & idempotent)
INSERT INTO platform_metadata (key, value, category, description) VALUES
  ('supported_countries', '["US", "GB", "CA", "IN", "IE", "AU", "DE", "FR"]', 'localization', 'List of country codes supported by profile configurations.'),
  ('supported_languages', '["en", "es", "fr", "de", "zh", "ja"]', 'localization', 'List of language ISO codes supported by localized screens.'),
  ('supported_timezones', '["UTC", "America/New_York", "Europe/London", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"]', 'localization', 'Authorized timezones for user profiles scheduler alignment.'),
  ('supported_locales', '["en-US", "en-GB", "es-ES", "fr-FR", "de-DE", "ja-JP"]', 'localization', 'Supported locales for text content renderings.')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    category = EXCLUDED.category,
    description = EXCLUDED.description;
