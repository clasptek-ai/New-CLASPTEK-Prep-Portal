import React from 'react';
import Link from 'next/link';

export default function SecurityPage() {
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
          <Link href="/account/notifications" className="nav-link">
            Notifications
          </Link>
        </nav>
      </header>

      <main className="shell-main">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1>Security & Session Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Inspect active login sessions and verify security logs.
          </p>

          <div style={{ marginTop: '2rem' }}>
            <h3>Active Login Sessions</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 0' }}>Device/Browser</th>
                  <th>IP Address</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '1rem 0' }}>Chrome 122 / Windows (Current)</td>
                  <td>192.168.1.50</td>
                  <td>United Kingdom</td>
                  <td style={{ color: 'var(--success)' }}>Active</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn"
                      disabled
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.825rem',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                      }}
                    >
                      Current
                    </button>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '1rem 0' }}>Safari / iOS 17</td>
                  <td>82.44.120.19</td>
                  <td>United Kingdom</td>
                  <td>Idle</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn"
                      disabled
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.825rem',
                        backgroundColor: 'var(--error)',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                      }}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <h3>Multi-Factor Authentication (MFA)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Privileged administrative staff accounts must enforce hardware tokens or authenticator
              application secrets.
            </p>
            <button className="btn" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              Configure MFA (Locked)
            </button>
          </div>

          <div style={{ marginTop: '2rem', fontSize: '0.875rem', textAlign: 'center' }}>
            <Link href="/account">&larr; Back to Account Dashboard</Link>
          </div>
        </div>
      </main>
    </>
  );
}
