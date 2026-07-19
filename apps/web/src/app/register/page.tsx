'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, ClasptekLogo, Card } from '../../components/ui/ui-components';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const getPasswordStrength = () => {
    if (!password) return '';
    if (password.length < 6) return 'WEAK';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'STRONG';
    return 'MEDIUM';
  };

  const strength = getPasswordStrength();

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Branded Hero Left Column */}
      <div style={{
        background: 'linear-gradient(135deg, var(--nav-bg), var(--background))',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRight: '1px solid var(--card-border)',
        color: '#ffffff',
        gap: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ClasptekLogo size="large" />
        </div>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.2 }}>
            Start Your Academic Readiness Pathway
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            Create an account to benchmark your placement readiness, complete mock testing tasks, and receive specialized AI evaluations.
          </p>
        </div>
      </div>

      {/* Form Right Column */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Create Account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Start your preparation journey with Clasptek V2</p>
          </div>

          {error && (
            <div style={{ backgroundColor: 'rgba(237, 27, 35, 0.1)', border: '1px solid rgba(237, 27, 35, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
              🎉 Registration successful! Redirecting to login page...
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="First Name"
                name="given-name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
              <Input
                label="Last Name"
                name="family-name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
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
              autoComplete="email"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Input
                label="Password"
                type="password"
                name="new-password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              
              {strength && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Strength:</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: strength === 'STRONG' ? 'var(--success)' : strength === 'MEDIUM' ? '#fbbf24' : 'var(--error)'
                  }}>
                    {strength}
                  </span>
                  <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--card-border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: strength === 'STRONG' ? '100%' : strength === 'MEDIUM' ? '60%' : '30%',
                      backgroundColor: strength === 'STRONG' ? 'var(--success)' : strength === 'MEDIUM' ? '#fbbf24' : 'var(--error)',
                      transition: 'width 0.2s ease'
                    }} />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Creating Profile...' : 'Register'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
