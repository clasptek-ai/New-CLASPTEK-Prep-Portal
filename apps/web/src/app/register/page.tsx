'use client';

import React from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main
      className="shell-main"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
    >
      <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
        <h2 style={{ textAlign: 'center' }}>Create Account</h2>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          Start your preparation journey with Clasptek V2
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                First Name
              </label>
              <input
                type="text"
                placeholder="John"
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
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
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
          </div>
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
          <button
            className="btn"
            disabled
            style={{ marginTop: '1rem', opacity: 0.6, cursor: 'not-allowed' }}
          >
            Register (Locked)
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <Link href="/login">Sign In</Link>
        </div>
      </div>
    </main>
  );
}
