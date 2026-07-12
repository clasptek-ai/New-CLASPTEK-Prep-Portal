'use client';

import React from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
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
          <Link href="/account/profile" className="nav-link">
            Profile
          </Link>
          <Link href="/account/security" className="nav-link">
            Security
          </Link>
        </nav>
      </header>

      <main className="shell-main">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1>Notification Preferences</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Configure template delivery methods. Under EGP-018, mandatory security notifications
            cannot be disabled.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--card-border)',
                paddingBottom: '1rem',
              }}
            >
              <div>
                <h4 style={{ margin: 0 }}>Security Alerts</h4>
                <p
                  style={{
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Email alerts regarding login anomalies, device verification, password resets.
                </p>
              </div>
              <input type="checkbox" defaultChecked disabled style={{ transform: 'scale(1.2)' }} />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--card-border)',
                paddingBottom: '1rem',
              }}
            >
              <div>
                <h4 style={{ margin: 0 }}>Transactional Notifications</h4>
                <p
                  style={{
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Confirmations for registration verification and account closing.
                </p>
              </div>
              <input type="checkbox" defaultChecked disabled style={{ transform: 'scale(1.2)' }} />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--card-border)',
                paddingBottom: '1rem',
              }}
            >
              <div>
                <h4 style={{ margin: 0 }}>Marketing & Preparation Updates</h4>
                <p
                  style={{
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Weekly summaries, progress tips, target goals updates (locked in Phase 1).
                </p>
              </div>
              <input type="checkbox" disabled style={{ transform: 'scale(1.2)' }} />
            </div>

            <button
              className="btn"
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed', marginTop: '1rem' }}
            >
              Save Preferences (Locked)
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
