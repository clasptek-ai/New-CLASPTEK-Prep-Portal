-- Database Initial Infrastructure Setup
-- Applied sequentially and locked as immutable in production.

CREATE TABLE IF NOT EXISTS migrations_log (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_metadata (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
