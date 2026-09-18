'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { validatePasswordStrength, updateUserPassword } from '@/lib/auth/reset-password';
import { PasswordStrength } from './PasswordStrength';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [success, setSuccess] = useState(false);

  const validation = validatePasswordStrength(password);
  const passwordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  useEffect(() => {
    const errParam = searchParams.get('error');
    const errCode = searchParams.get('error_code');

    if (errParam === 'invalid_token' || errCode === 'otp_expired' || errParam === 'access_denied') {
      setIsInvalidToken(true);
      setError('This password reset link is no longer valid.');
      return;
    }

    // Verify established recovery session (Server SSR Cookie session or Browser Client session)
    async function initRecoverySession() {
      try {
        const supabase = getSupabaseBrowserClient();

        // 1. Check for legacy URL Hash Fragment (#access_token=...&refresh_token=...)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken) {
            const { error: setErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            if (setErr) {
              console.error('setSession error from hash:', setErr.message);
            }
          }
        }

        // 2. Listen for Supabase Auth recovery events
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            setIsInvalidToken(false);
            setError(null);
          }
        });

        // 3. Check for active SSR HTTP-Only Cookie Session via server endpoint
        let hasActiveSsrSession = false;
        try {
          const ssrRes = await fetch('/api/v1/auth/session');
          if (ssrRes.ok) {
            const ssrJson = await ssrRes.json();
            if (ssrJson.success && ssrJson.user) {
              hasActiveSsrSession = true;
            }
          }
        } catch {
          // SSR check network fallback
        }

        // 4. Check for active Browser Client Session
        const {
          data: { session: browserSession },
        } = await supabase.auth.getSession();

        if (hasActiveSsrSession || browserSession) {
          setIsInvalidToken(false);
          setError(null);
        } else if (errParam || errCode) {
          // Only show link expired if explicit error query params exist
          setIsInvalidToken(true);
          setError('This password reset link is no longer valid.');
        } else {
          // Default to allowing password entry (form submit will validate session via API)
          setIsInvalidToken(false);
          setError(null);
        }

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Session initialization error:', err);
      }
    }

    initRecoverySession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.isValid) {
      setError('Please ensure your password meets all strength requirements below.');
      return;
    }

    if (!passwordsMatch) {
      setError('New Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await updateUserPassword(password);

    if (res.success) {
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(res.error || 'Failed to update password. Please request a new recovery link.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Link Expired State */}
      {isInvalidToken && !success && (
        <div className="text-center space-y-5 py-2">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-(--text-primary) tracking-tight">Link Expired</h2>
            <p className="text-xs sm:text-sm text-(--text-secondary) leading-relaxed">
              This password reset link is no longer valid.
            </p>
            <p className="text-xs text-(--text-muted)">
              Request a new password reset email to continue.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/forgot-password"
              className="w-full py-3 px-4 bg-(--brand) hover:bg-(--brand-hover) text-white font-bold text-sm rounded-lg flex items-center justify-center space-x-2 transition-all min-h-11 shadow-sm"
            >
              <span>Request New Link</span>
              <ArrowRight size={16} />
            </Link>

            <div>
              <Link
                href="/login"
                className="text-xs text-(--text-secondary) hover:text-(--brand-light) font-semibold inline-flex items-center space-x-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className="text-center space-y-5 py-2">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-(--text-primary) tracking-tight">Password Updated</h2>
            <p className="text-xs sm:text-sm text-(--text-secondary) leading-relaxed">
              Your password has been changed successfully.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-(--brand) hover:bg-(--brand-hover) text-white font-bold text-sm rounded-lg flex items-center justify-center space-x-2 transition-all min-h-11 shadow-sm"
            >
              <span>Continue to Sign In</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Active Reset Password Form */}
      {!isInvalidToken && !success && (
        <div className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-(--text-secondary)">
                New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full bg-(--surface-1) border border-(--border) rounded-lg px-3.5 py-2.5 pr-11 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-(--brand) focus:ring-1 focus:ring-(--brand) min-h-11 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-secondary) p-1 flex items-center justify-center min-h-8"
                  aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-(--text-secondary)">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="w-full bg-(--surface-1) border border-(--border) rounded-lg px-3.5 py-2.5 pr-11 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-(--brand) focus:ring-1 focus:ring-(--brand) min-h-11 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-secondary) p-1 flex items-center justify-center min-h-8"
                  aria-label={
                    showConfirmPassword ? 'Hide Confirm Password' : 'Show Confirm Password'
                  }
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <span className="text-[11px] text-red-400 font-semibold block pt-0.5">
                  ⚠️ Passwords do not match
                </span>
              )}
            </div>

            {/* Password Strength Meter */}
            <PasswordStrength validation={validation} passwordLength={password.length} />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-(--brand) hover:bg-(--brand-hover) disabled:bg-(--surface-2) disabled:text-(--text-muted) disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg flex items-center justify-center space-x-2 transition-all min-h-11 shadow-sm mt-2"
            >
              <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="pt-4 border-t border-(--border) flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <Link
              href="/login"
              className="text-(--text-secondary) hover:text-(--brand-light) font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
            <div className="text-(--text-secondary) text-center sm:text-right">
              <span className="text-(--text-muted)">Need another email? </span>
              <Link href="/forgot-password" className="text-(--brand-light) hover:underline font-semibold">
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPasswordForm;
