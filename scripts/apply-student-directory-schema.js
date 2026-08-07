const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function applySchema() {
  console.log('=================================================================');
  console.log('APPLYING STUDENT DIRECTORY DATABASE SCHEMA MIGRATION');
  console.log('=================================================================\n');

  // 1. Add gate and deletion columns to public.users
  await pool.query(`
    ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by UUID,
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS practice_gate_locked BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS practice_gate_reason TEXT,
    ADD COLUMN IF NOT EXISTS practice_gate_updated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS practice_gate_updated_by UUID,
    ADD COLUMN IF NOT EXISTS mock_gate_locked BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS mock_gate_reason TEXT,
    ADD COLUMN IF NOT EXISTS mock_gate_updated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS mock_gate_updated_by UUID;
  `);

  // 2. Add audit_logs table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      payload JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('✓ Columns added to public.users idempotently');
  console.log('✓ Audit logs table verified');
  console.log('=================================================================');
  await pool.end();
}

applySchema().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
