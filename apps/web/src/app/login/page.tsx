'use client';

import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main
      className="shell-main"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
    >
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center' }}>Sign In</h2>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          Clasptek Prep Portal Account Login
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@domain.com"
              disabled
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
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              disabled
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
          <button
            className="btn"
            disabled
            style={{ marginTop: '1rem', opacity: 0.6, cursor: 'not-allowed' }}
          >
            Sign In (Locked)
          </button>
        </form>
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
          }}
        >
          <Link href="/forgot-password">Forgot Password?</Link>
          <Link href="/register">Create Account</Link>
        </div>
        <div
          style={{
            marginTop: '2rem',
            borderTop: '1px solid var(--card-border)',
            paddingTop: '1rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          Sprint 1.1 Foundation Active. Identity aggregate mapping occurs in Sprint 1.3.
        </div>
      </div>
    </main>
  );
}
