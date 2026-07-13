-- Database Initial Infrastructure Setup
-- Applied sequentially and locked as immutable in production.

CREATE TABLE IF NOT EXISTS migrations_log (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
