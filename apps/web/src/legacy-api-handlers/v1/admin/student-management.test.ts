 
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables before loading modules
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { NextRequest } from 'next/server';

// Mock persistence and auth modules
const mockQuery = vi.fn();
vi.mock('@clasptek/persistence', () => {
  return {
    DatabasePool: vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      getPool: () => ({
        query: mockQuery,
      }),
    })),
  };
});

const mockResetPasswordForEmail = vi.fn();
const mockSignOut = vi.fn();
const mockUpdateUserById = vi.fn();
vi.mock('@/lib/supabase-client', () => {
  return {
    getSupabaseServerClient: () => ({
      auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
        admin: {
          signOut: mockSignOut,
          updateUserById: mockUpdateUserById,
        },
      },
    }),
  };
});

vi.mock('@/lib/auth-util', () => ({
  getAuthenticatedSession: vi.fn(),
}));

import { getAuthenticatedSession } from '@/lib/auth-util';
import { POST as ResetPasswordHandler } from './users/[id]/reset-password/route';
import { PATCH as UpdateStatusHandler } from './users/[id]/status/route';

describe('Student Administration API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/admin/users/[id]/reset-password', () => {
    test('Returns HTTP 401 Unauthorized if user is not an administrator', async () => {
      vi.mocked(getAuthenticatedSession).mockResolvedValueOnce({
        userId: 'u-student',
        profileId: 'p-student',
        roles: ['STUDENT'],
      });

      const req = new NextRequest('http://localhost:3000/api/v1/admin/users/std-1/reset-password', {
        method: 'POST',
      });
      const res = await ResetPasswordHandler(req, { params: Promise.resolve({ id: 'std-1' }) });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('Returns HTTP 404 if candidate student record does not exist', async () => {
      vi.mocked(getAuthenticatedSession).mockResolvedValueOnce({
        userId: 'u-admin',
        profileId: 'p-admin',
        roles: ['ADMINISTRATOR'],
      });

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const req = new NextRequest(
        'http://localhost:3000/api/v1/admin/users/std-missing/reset-password',
        {
          method: 'POST',
        }
      );
      const res = await ResetPasswordHandler(req, {
        params: Promise.resolve({ id: 'std-missing' }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.message).toContain('not found');
    });

    test('Dispatches Supabase reset email and returns HTTP 200 OK for valid candidate', async () => {
      vi.mocked(getAuthenticatedSession).mockResolvedValueOnce({
        userId: 'u-admin',
        profileId: 'p-admin',
        roles: ['ADMINISTRATOR'],
      });

      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'std-100', email: 'candidate@clasptek.org' }],
      });
      mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });

      const req = new NextRequest(
        'http://localhost:3000/api/v1/admin/users/std-100/reset-password',
        {
          method: 'POST',
        }
      );
      const res = await ResetPasswordHandler(req, { params: Promise.resolve({ id: 'std-100' }) });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'candidate@clasptek.org',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/callback?next=/reset-password'),
        })
      );
    });
  });

  describe('PATCH /api/v1/admin/users/[id]/status', () => {
    test('Persists status change to SUSPENDED and revokes sessions globally', async () => {
      vi.mocked(getAuthenticatedSession).mockResolvedValueOnce({
        userId: 'u-admin',
        profileId: 'p-admin',
        roles: ['ADMINISTRATOR'],
      });

      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'std-200' }] }); // check user
      mockQuery.mockResolvedValueOnce({ rows: [] }); // update status
      mockQuery.mockResolvedValueOnce({ rows: [] }); // update security profile

      mockSignOut.mockResolvedValueOnce({ error: null });
      mockUpdateUserById.mockResolvedValueOnce({ error: null });

      const req = new NextRequest('http://localhost:3000/api/v1/admin/users/std-200/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'SUSPENDED', reason: 'Non-payment' }),
      });
      const res = await UpdateStatusHandler(req, { params: Promise.resolve({ id: 'std-200' }) });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.status).toBe('SUSPENDED');
      expect(mockSignOut).toHaveBeenCalledWith('std-200', 'global');
      expect(mockUpdateUserById).toHaveBeenCalledWith('std-200', { ban_duration: '87600h' });
    });

    test('Persists status change to ACTIVE and unbans candidate account in Supabase Auth', async () => {
      vi.mocked(getAuthenticatedSession).mockResolvedValueOnce({
        userId: 'u-admin',
        profileId: 'p-admin',
        roles: ['ADMINISTRATOR'],
      });

      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'std-200' }] });
      mockQuery.mockResolvedValueOnce({ rows: [] });

      mockUpdateUserById.mockResolvedValueOnce({ error: null });

      const req = new NextRequest('http://localhost:3000/api/v1/admin/users/std-200/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACTIVE', reason: 'Restored access' }),
      });
      const res = await UpdateStatusHandler(req, { params: Promise.resolve({ id: 'std-200' }) });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.status).toBe('ACTIVE');
      expect(mockUpdateUserById).toHaveBeenCalledWith('std-200', { ban_duration: 'none' });
    });
  });
});
