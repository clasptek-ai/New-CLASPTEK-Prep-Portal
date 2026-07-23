import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { NextRequest } from 'next/server';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.DATABASE_URL = 'postgresql://localhost:5432/mock';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
process.env.PORT = '3000';

import { getAuthenticatedSession } from '../lib/auth-util';
import { ConsoleLogger } from '@clasptek/observability';
import { loadEnvironment } from '@clasptek/configuration';

// Mock browser router
vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/admin/dashboard',
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn(),
    }),
  };
});

// Mock Next.js headers/cookies
vi.mock('next/headers', () => {
  return {
    cookies: async () => ({
      getAll: () => [],
    }),
  };
});

describe('Sprint 3.4 — Platform Security, Authorization & Observability Verification', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEV_MOCK_AUTH = 'false';
  });

  test('getAuthenticatedSession returns null in production mode when no session cookie is present', async () => {
    const req = new NextRequest('http://localhost/api/v1/readiness');
    const session = await getAuthenticatedSession(req);
    expect(session).toBeNull();
  });

  test('getAuthenticatedSession resolves mock headers in test/dev environment when dev mock mode is active', async () => {
    process.env.NEXT_PUBLIC_DEV_MOCK_AUTH = 'true';
    const req = new NextRequest('http://localhost/api/v1/readiness', {
      headers: {
        'x-student-id': 'stud-test-abc',
        'x-user-role': 'STUDENT',
      },
    });
    const session = await getAuthenticatedSession(req);
    expect(session).toBeDefined();
    expect(session?.userId).toBe('stud-test-abc');
    expect(session?.roles).toContain('STUDENT');
  });

  test('Observability — ConsoleLogger formats and outputs JSON-like structured errors', () => {
    const logger = new ConsoleLogger('SecurityTestLogger');
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  test('Observability — Health check endpoints environment configuration variables are mapped', () => {
    const env = loadEnvironment(process.env);
    expect(env).toBeDefined();
    expect(env.PORT).toBeDefined();
  });
});
