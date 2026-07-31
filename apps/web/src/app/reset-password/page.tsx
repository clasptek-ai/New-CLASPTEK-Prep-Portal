'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errParam = searchParams.get('error');
    if (errParam === 'invalid_token') {
      setError('This password reset link is invalid or has expired. Please request a new recovery link.');
    }
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
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reset password. Recovery session may be expired.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="shell-main"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
    >
      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <h2>Set New Password</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Choose a secure new password for your Clasptek Prep Portal account.
        </p>

        {error && (
          <div
            style={{
              backgroundColor: '#7f1d1d',
              color: '#f87171',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
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
              backgroundColor: '#064e3b',
              color: '#34d399',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            Password successfully reset! Redirecting to login page...
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
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
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--background)',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Confirm New Password"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--background)',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Resetting Password...' : 'Update Password'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <Link href="/login">Return to Sign In</Link>
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
