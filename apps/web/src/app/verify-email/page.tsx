'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, ClasptekLogo } from '../../components/ui/ui-components';
import { useNotification } from '../../providers/notification-provider';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { showSuccess } = useNotification();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.message || 'Email verification failed. Code might be incorrect or expired.'
        );
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

  const handleResend = () => {
    showSuccess('Verification code resent successfully to your email address!');
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
      }}
    >
      {/* Branded Hero Left Column */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--nav-bg), var(--background))',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRight: '1px solid var(--card-border)',
          color: '#ffffff',
          gap: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ClasptekLogo size="large" />
        </div>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.2 }}>
            Verify Your Academic Identity
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            Enter the 6-digit confirmation code dispatched to your registered email address to
            finalize portal authorization.
          </p>
        </div>
      </div>

      {/* Form Right Column */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
      >
        <div
          style={{
            maxWidth: '400px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Verify Email
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              Enter code to secure your Clasptek learning portal.
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(237, 27, 35, 0.1)',
                border: '1px solid rgba(237, 27, 35, 0.3)',
                color: '#f87171',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
              }}
            >
              🎉 Email successfully verified! Redirecting to login...
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Verification Code"
              type="text"
              placeholder="6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              autoComplete="one-time-code"
            />

            <Button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Verifying Code...' : 'Verify Code'}
            </Button>
          </form>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem',
            }}
          >
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-hover)',
                cursor: 'pointer',
                fontWeight: 700,
                padding: 0,
              }}
            >
              Resend Code
            </button>
            <Link href="/login" style={{ color: 'var(--text-muted)' }}>
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
