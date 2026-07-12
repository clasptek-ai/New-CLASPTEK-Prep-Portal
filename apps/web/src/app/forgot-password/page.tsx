'use client';

import React from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <main
      className="shell-main"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
    >
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2>Reset Password</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Enter your email address to receive a recovery link.
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
          <button
            className="btn"
            disabled
            style={{ marginTop: '1rem', opacity: 0.6, cursor: 'not-allowed' }}
          >
            Send Recovery Link (Locked)
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Remembered your password? <Link href="/login">Sign In</Link>
        </div>
      </div>
    </main>
  );
}
