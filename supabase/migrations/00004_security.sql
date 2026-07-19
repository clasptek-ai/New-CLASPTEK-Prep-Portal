-- Database Schema for Security Domain
-- Creates tables with UUID keys, optimistic version concurrency, soft deletes, and integrity constraints.

CREATE TABLE IF NOT EXISTS security_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_mfa VARCHAR(50),
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  lock_status VARCHAR(50) NOT NULL CHECK (lock_status IN ('UNLOCKED', 'LOCKED')) DEFAULT 'UNLOCKED',
  security_preferences JSONB,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT uq_security_profiles_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint VARCHAR(512) NOT NULL,
  trust_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_security_profiles_user ON security_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);
