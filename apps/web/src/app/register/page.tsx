'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '../shell/AuthShell';
import { Button } from '../../shared/ui/button/Button';
import { Input } from '../../shared/ui/input/Input';
import { Alert } from '../../shared/ui/alert/Alert';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, provider: 'LOCAL' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to register account');
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
    <AuthShell title="Create Account" subtitle="Start your preparation journey with Clasptek V2.">
      {error && (
        <Alert variant="error" title="Registration Error" style={{ marginBottom: '1.0rem' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" title="Success" style={{ marginBottom: '1.0rem' }}>
          🎉 Registration successful! Redirecting to login page...
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.0rem' }}>
          <Input
            label="First Name"
            name="given-name"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            name="family-name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          name="new-password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {loading ? 'Creating Profile...' : 'Register Account'}
        </Button>
      </form>

      <div
        style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted, #94a3b8)',
        }}
      >
        Already have an account?{' '}
        <Link
          href="/login"
          style={{ color: 'var(--primary-500, #3b82f6)', fontWeight: 700, textDecoration: 'none' }}
        >
          Sign In
        </Link>
      </div>
    </AuthShell>
  );
}
