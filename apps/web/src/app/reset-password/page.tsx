'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '@/lib/api-fetch';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errParam = searchParams.get('error');
    if (errParam === 'invalid_token') {
      setError('This password reset link is invalid or has expired. Please request a new recovery link.');
    }

    // Check for active Supabase recovery session on load
    async function checkRecoverySession() {
      try {
        const supabase = getSupabaseBrowserClient();
        
        // Listen for PASSWORD_RECOVERY event if URL hash fragment contains token
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            setHasValidSession(true);
            setError(null);
          }
        });

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasValidSession(true);
        }

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error checking recovery session:', err);
      }
    }

    checkRecoverySession();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Primary: Submit to server API endpoint via authFetch with Bearer token
      const res = await authFetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        // 2. Client-side fallback: Call Supabase browser client updateUser directly
        const supabase = getSupabaseBrowserClient();
        const { error: clientError } = await supabase.auth.updateUser({ password });
        if (clientError) {
          throw new Error(data.message || clientError.message || 'Failed to reset password. Recovery session may be expired.');
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="shell-main"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}
    >
      <div className="card" style={{ maxWidth: '440px', width: '100%', backgroundColor: '#111827', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '16px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
          Set New Password
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Choose a secure new password for your Clasptek Prep Portal account.
        </p>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              padding: '0.85rem',
              borderRadius: '10px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
            {error.includes('expired') || error.includes('invalid') ? (
              <div style={{ marginTop: '0.5rem' }}>
                <Link href="/forgot-password" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                  Request New Password Reset Link
                </Link>
              </div>
            ) : null}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              padding: '0.85rem',
              borderRadius: '10px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              textAlign: 'center',
              fontWeight: 700,
            }}
          >
            🎉 Password successfully reset! Redirecting to login page...
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                backgroundColor: '#161e2e',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Re-enter new password"
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                backgroundColor: '#161e2e',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || success}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.85rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: '10px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <Link href="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
            Return to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>Loading Password Reset...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
