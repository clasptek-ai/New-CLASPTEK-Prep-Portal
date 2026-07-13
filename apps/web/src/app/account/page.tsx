'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SupabaseUser {
  id: string;
  email?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch('/api/v1/auth/session');
      if (!res.ok) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Signout failure', err);
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading account settings...</div>;
  }

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
          <a href="#" onClick={handleSignOut} className="nav-link">
            Sign Out
          </a>
        </nav>
      </header>

      <main className="shell-main">
        <div className="card">
          <h1>My Account</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Manage your personal profile, credentials, active sessions, and communication
            preferences.
          </p>
          {user && (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Logged in as: <strong>{user.email}</strong>
            </div>
          )}
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
