import { authFetch } from '@/lib/api-fetch';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  score: number;
  isValid: boolean;
}

/**
 * Live validation helper for password security requirements:
 * 1. Minimum 8 characters
 * 2. At least one uppercase letter (A-Z)
 * 3. At least one lowercase letter (a-z)
 * 4. At least one numeric digit (0-9)
 * 5. At least one special character (!@#$%^&*...)
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const criteria = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar];
  const score = criteria.filter(Boolean).length;
  const isValid = criteria.every(Boolean);

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    score,
    isValid,
  };
}

export async function updateUserPassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseBrowserClient();

    // 1. Primary: Direct Supabase Auth browser client password update
    const { error: clientError } = await supabase.auth.updateUser({ password: newPassword });

    if (!clientError) {
      return { success: true };
    }

    console.warn('Direct Supabase client updateUser warning:', clientError.message);

    // 2. Fallback: Server API endpoint via authFetch with Bearer token
    const res = await authFetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      return { success: true };
    }

    return {
      success: false,
      error:
        clientError.message ||
        data.message ||
        'Failed to update password. Recovery session may be expired.',
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
