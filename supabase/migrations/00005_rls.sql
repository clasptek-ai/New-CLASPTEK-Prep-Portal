-- Row Level Security (RLS) Policies for the Platform Foundation
-- Restricts user access to their own data matching auth.uid()
-- Note: Supabase background workers and dashboard administrators using the 'service_role' key bypass RLS automatically.

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE authentication_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Configure own-record access RLS policies

-- Users policies
CREATE POLICY select_own_user ON users FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY update_own_user ON users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Identities policies
CREATE POLICY select_own_identity ON identities FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY update_own_identity ON identities FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Profiles policies
CREATE POLICY select_own_profile ON profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY update_own_profile ON profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Security Profiles policies
CREATE POLICY select_own_sec_profile ON security_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY update_own_sec_profile ON security_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Security Sessions policies
CREATE POLICY select_own_sessions ON security_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY update_own_sessions ON security_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Authentication Methods policies
CREATE POLICY select_own_methods ON authentication_methods FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY update_own_methods ON authentication_methods FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trusted Devices policies
CREATE POLICY select_own_trusted_devices ON trusted_devices FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY update_own_trusted_devices ON trusted_devices FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User Roles policies
CREATE POLICY select_own_roles ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3. Grant schema usage and table privileges to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
