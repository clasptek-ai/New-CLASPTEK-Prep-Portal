'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, ClasptekLogo } from '../../components/ui/ui-components';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(false);

  useEffect(() => {
    if (searchParams.get('timeout') === 'true') {
      setSessionTimeout(true);
    }
  }, [searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // ── Client-side validation ──────────────────────────────────────
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Map structured error codes to user-friendly messages
        if (data.code === 'ACCOUNT_LOCKED') {
          setError('Your account has been temporarily locked due to too many failed attempts. Please contact support.');
        } else if (data.code === 'AUTH_ERROR') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (data.code === 'INTERNAL_ERROR') {
          setError('A server error occurred. Please try again in a moment.');
        } else {
          setError(data.message || 'Login failed. Please verify your email and password.');
        }
        return;
      }

      // ── Role-based redirect ─────────────────────────────────────────
      const roles: string[] = data.roles ?? ['STUDENT'];
      if (roles.includes('ADMINISTRATOR')) {
        router.push('/admin/dashboard');
      } else if (roles.includes('INSTRUCTOR')) {
        router.push('/instructor/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Unable to connect to the server. Please check your internet connection and try again.');
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
            Empowering Global Career Journeys
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            Log in to access your interactive exam readiness dashboards, adaptive practice portals, and instant AI-driven assessments evaluation scores.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span>💻</span>
            <span>Technology & Innovation Core Credentials</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span>📊</span>
            <span>Business & Management Strategic Analytics</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span>🌍</span>
            <span>Global Exam Prep (IELTS, TOEFL, SAT, CELPIP)</span>
          </div>
        </div>
      </div>

      {/* Form Right Column */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Sign in to continue your Clasptek learning portal.</p>
          </div>

          {sessionTimeout && (
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
              ⚠️ Your login session has timed out. Please sign in again.
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: 'rgba(237, 27, 35, 0.1)', border: '1px solid rgba(237, 27, 35, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '38px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {capsLock && (
              <div style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 600 }}>
                ⚠️ Caps Lock is active!
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                Remember Me
              </label>
              <Link href="/forgot-password" style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>Forgot Password?</Link>
            </div>

            <Button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Verifying Session...' : 'Sign In'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            New to Clasptek?{' '}
            <Link href="/register" style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19', color: '#ffffff' }}>Loading Portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
