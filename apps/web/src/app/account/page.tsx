import React from 'react';
import Link from 'next/link';

export default function AccountPage() {
  return (
    <>
      <header className="shell-header">
        <Link href="/" className="shell-brand">
          CLASPTEK PREP PORTAL V2
        </Link>
        <nav className="shell-nav">
          <Link href="/account/profile" className="nav-link">
            Profile
          </Link>
          <Link href="/account/security" className="nav-link">
            Security
          </Link>
          <Link href="/account/notifications" className="nav-link">
            Notifications
          </Link>
          <Link href="/" className="nav-link">
            Sign Out
          </Link>
        </nav>
      </header>

      <main className="shell-main">
        <div className="card">
          <h1>My Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage your personal profile, credentials, active sessions, and communication
            preferences.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
          }}
        >
          <div className="card" style={{ margin: 0 }}>
            <h2>Person Profile</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Update your personal identity details, name, and profile settings.
            </p>
            <Link href="/account/profile" style={{ fontWeight: 600 }}>
              Manage Profile &rarr;
            </Link>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <h2>Active Devices & Security</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Inspect logins, session parameters, and revoke device authorization tokens.
            </p>
            <Link href="/account/security" style={{ fontWeight: 600 }}>
              Manage Security &rarr;
            </Link>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <h2>Notifications</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Set channel configurations and subscribe/unsubscribe from templates.
            </p>
            <Link href="/account/notifications" style={{ fontWeight: 600 }}>
              Manage Notifications &rarr;
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
