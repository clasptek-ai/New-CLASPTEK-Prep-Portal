'use client';

import React from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <>
      <header className="shell-header">
        <Link href="/account" className="shell-brand">
          CLASPTEK PREP PORTAL V2
        </Link>
        <nav className="shell-nav">
          <Link href="/account" className="nav-link">
            Account
          </Link>
          <Link href="/account/security" className="nav-link">
            Security
          </Link>
          <Link href="/account/notifications" className="nav-link">
            Notifications
          </Link>
        </nav>
      </header>

      <main className="shell-main">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1>Person Profile</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Review your profile parameters. PII minimization is active in accordance with EGP-013.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="John"
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
                  defaultValue="Doe"
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
                Primary Email
              </label>
              <input
                type="email"
                defaultValue="you@domain.com"
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
              style={{ opacity: 0.6, cursor: 'not-allowed', marginTop: '1rem' }}
            >
              Save Profile (Locked)
            </button>
          </form>
          <div style={{ marginTop: '2rem', fontSize: '0.875rem', textAlign: 'center' }}>
            <Link href="/account">&larr; Back to Account Dashboard</Link>
          </div>
        </div>
      </main>
    </>
  );
}
