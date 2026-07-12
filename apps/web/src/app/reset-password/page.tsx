'use client';

import React from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <main
      className="shell-main"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
    >
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2>Enter New Password</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Choose a secure new password for your account.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="Min 8 characters"
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
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm Password"
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
            Reset Password (Locked)
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <Link href="/login">Return to Sign In</Link>
        </div>
      </div>
    </main>
  );
}
