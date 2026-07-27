import { describe, test, expect } from 'vitest';
import { loginSchema } from './login.schema';

describe('LoginForm Reference Architecture & Validation Standard Tests', () => {
  test('loginSchema validates correct credentials successfully', () => {
    const valid = { email: 'student@clasptek.edu', password: 'password123' };
    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  test('loginSchema rejects invalid email format', () => {
    const invalidEmail = { email: 'not-an-email', password: 'password123' };
    const result = loginSchema.safeParse(invalidEmail);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please enter a valid email address');
    }
  });

  test('loginSchema rejects missing email or password', () => {
    const empty = { email: '', password: '' };
    const result = loginSchema.safeParse(empty);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('loginSchema enforces minimum password length', () => {
    const shortPassword = { email: 'user@clasptek.edu', password: '123' };
    const result = loginSchema.safeParse(shortPassword);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 6 characters');
    }
  });
});
