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
    <div className="w-full max-w-115 mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
      {/* Top Logo Badge */}
      <div className="flex justify-center">
        <LogoBadge size="md" />
      </div>

      {/* Link Expired State Card */}
      {isInvalidToken && !success && (
        <div className="text-center space-y-5 py-2">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={30} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Link Expired</h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This password reset link is no longer valid.
            </p>
            <p className="text-xs text-slate-400">
              Request a new password reset email to continue.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/forgot-password"
              className="w-full py-3.5 px-5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-sky-500/20 min-h-11"
            >
              <span>Request New Link</span>
              <ArrowRight size={16} />
            </Link>

            <div>
              <Link
                href="/login"
                className="text-xs text-slate-400 hover:text-sky-400 font-semibold inline-flex items-center space-x-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Success State Card */}
      {success && (
        <div className="text-center space-y-5 py-2">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={30} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Password Updated</h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your password has been changed successfully.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 px-5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-sky-500/20 min-h-11"
            >
              <span>Continue to Sign In</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Active Reset Password Form Card */}
      {!isInvalidToken && !success && (
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">Enter a new password below.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                New Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-11 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 min-h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 flex items-center justify-center min-h-8"
                  aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-11 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 min-h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 flex items-center justify-center min-h-8"
                  aria-label={
                    showConfirmPassword ? 'Hide Confirm Password' : 'Show Confirm Password'
                  }
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <span className="text-[11px] text-rose-400 font-semibold block pt-0.5">
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
              className="w-full py-3.5 px-5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-sky-500/20 min-h-11"
            >
              <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <Link
              href="/login"
              className="text-slate-400 hover:text-sky-400 font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
            <div className="text-slate-400 text-center sm:text-right">
              <span className="text-slate-500">Need another email? </span>
              <Link href="/forgot-password" className="text-sky-400 hover:underline font-semibold">
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPasswordForm;
