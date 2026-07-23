import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService, normalizeRole } from '../services/auth.service';
import { loginSchema, registerSchema } from '../schemas/auth.schemas';

vi.mock('../../../services/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { apiClient } from '../../../services/api/client';

describe('Auth Service & Role Normalizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes role variations correctly', () => {
    expect(normalizeRole('Super Administrator')).toBe('ADMINISTRATOR');
    expect(normalizeRole('SYSTEM_ADMIN')).toBe('ADMINISTRATOR');
    expect(normalizeRole('Administrator')).toBe('ADMINISTRATOR');
    expect(normalizeRole('Instructor')).toBe('INSTRUCTOR');
    expect(normalizeRole('Student')).toBe('STUDENT');
  });

  it('validates login schema correctly', () => {
    const valid = loginSchema.safeParse({ email: 'test@clasptek.edu', password: 'Password123' });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({ email: 'not-an-email', password: 'short' });
    expect(invalid.success).toBe(false);
  });

  it('validates registration schema requirements', () => {
    const valid = registerSchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@clasptek.edu',
      password: 'Password123',
    });
    expect(valid.success).toBe(true);
  });

  it('handles login service invocation cleanly', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      user: { id: 'u123', email: 'test@clasptek.edu' },
      roles: ['Super Administrator'],
    });

    const res = await authService.login({ email: 'test@clasptek.edu', password: 'Password123' });
    expect(res.user.userId).toBe('u123');
    expect(res.user.roles).toContain('ADMINISTRATOR');
  });
});
