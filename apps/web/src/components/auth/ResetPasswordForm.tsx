'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Zap,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { LogoBadge } from '@/shared/ui/logo/LogoBadge';
import { validatePasswordStrength, updateUserPassword } from '@/lib/auth/reset-password';
import { PasswordStrength } from './PasswordStrength';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export function ResetPasswordForm() {
  const router = useRouter();
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
    const code = searchParams.get('code');
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') || 'recovery';

    if (errParam === 'invalid_token' || errCode === 'otp_expired' || errParam === 'access_denied') {
      setIsInvalidToken(true);
      setError(
        'This password reset link is invalid or has expired. Please request a new password reset email.'
      );
      return;
    }

    // Exchange recovery code or token_hash for a Supabase Auth session on load
    async function initRecoverySession() {
      try {
        const supabase = getSupabaseBrowserClient();

        // 1. If 'code' is present in URL (?code=...), exchange PKCE code for session
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error(
              'exchangeCodeForSession error on /reset-password:',
              exchangeError.message
            );
            setIsInvalidToken(true);
            setError(
              'This password reset link is invalid or has expired. Please request a new password reset email.'
            );
            return;
          }
        }

        // 2. If 'token_hash' is present in URL (?token_hash=...), verify OTP for session
        if (token_hash) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });
          if (otpError) {
            console.error('verifyOtp error on /reset-password:', otpError.message);
            setIsInvalidToken(true);
            setError(
              'This password reset link is invalid or has expired. Please request a new password reset email.'
            );
            return;
          }
        }

        // 3. Listen for Supabase Auth recovery events (e.g. hash fragments)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            setIsInvalidToken(false);
            setError(null);
          }
        });

        // 4. Verify an active Supabase recovery session exists
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsInvalidToken(false);
          setError(null);
        } else {
          const hasHashToken =
            typeof window !== 'undefined' && window.location.hash.includes('access_token');
          if (!hasHashToken && !code && !token_hash) {
            setIsInvalidToken(true);
            setError(
              'No active password recovery session found. Please request a new password reset email.'
            );
          }
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
      setTimeout(() => {
        router.push('/login');
      }, 3500);
    } else {
      setError(res.error || 'Failed to update password. Please request a new recovery link.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-150 cq-container">
      {/* LEFT PANEL (DESKTOP) — BRANDING & FEATURES */}
      <div className="lg:col-span-5 bg-linear-to-br from-slate-950 via-slate-900 to-sky-950/40 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-8">
        <div className="space-y-6">
          <LogoBadge size="md" />

          <div className="space-y-3 pt-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Create a new password to regain access to your Clasptek Prep Portal account. Your new
              password should be secure and easy for you to remember.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start space-x-3.5">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Secure Password Reset</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  End-to-end encrypted password verification.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start space-x-3.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant Account Recovery</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Immediate portal session restoration upon submission.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start space-x-3.5">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Protected by Supabase Authentication
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enterprise security & zero credential exposure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center space-x-2 text-xs text-slate-500">
          <KeyRound size={16} className="text-sky-400" />
          <span>Clasptek Academic Identity Engine v4.0</span>
        </div>
      </div>

      {/* RIGHT PANEL — RESET PASSWORD CARD & FORM */}
      <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-6 bg-slate-900">
        {/* Invalid or Expired Token Dedicated Screen */}
        {isInvalidToken && !success && (
          <div className="p-8 bg-slate-950 border border-rose-500/30 rounded-3xl text-center space-y-5">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Password Reset Link Expired</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                This password reset link has expired or has already been used. Please request a new
                password reset email.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-sky-500/20 min-h-11"
              >
                <span>Request New Reset Link</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Success State Card */}
        {success ? (
          <div className="p-8 bg-slate-950 border border-emerald-500/30 rounded-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Password Updated Successfully</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                Your password has been changed. You can now sign in using your new password.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-sky-500/20 min-h-11"
              >
                <span>Go to Login</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <p className="text-[11px] text-slate-500">
              Redirecting to login automatically in 3 seconds...
            </p>
          </div>
        ) : (
          !isInvalidToken && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Reset Password</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your new password below and confirm to complete recovery.
                </p>
              </div>

              {error && !isInvalidToken && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center space-x-2.5">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 min-h-8 flex items-center justify-center"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 min-h-8 flex items-center justify-center"
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
                  disabled={loading || !validation.isValid || !passwordsMatch}
                  className="w-full py-3.5 px-5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-sky-500/20 min-h-11"
                >
                  <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              {/* Navigation Links */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <Link
                  href="/login"
                  className="text-slate-400 hover:text-sky-400 font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Login</span>
                </Link>
                <Link
                  href="/forgot-password"
                  className="text-sky-400 hover:underline font-semibold"
                >
                  Request New Reset Link
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default ResetPasswordForm;
