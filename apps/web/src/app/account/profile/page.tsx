'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  locale?: string;
  timeZone?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [locale, setLocale] = useState('en');
  const [timeZone, setTimeZone] = useState('UTC');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/identity/profiles/${MOCK_USER_ID}`);
      if (res.status === 404) {
        setProfile(null);
      } else if (!res.ok) {
        throw new Error('Failed to load user profile');
      } else {
        const data = await res.json();
        setProfile(data.profile);
        setFirstName(data.profile.firstName);
        setLastName(data.profile.lastName);
        setAvatar(data.profile.avatar || '');
        setLocale(data.profile.locale || 'en');
        setTimeZone(data.profile.timeZone || 'UTC');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function provisionMockUser() {
    setLoading(true);
    setError(null);
    try {
      const createRes = await fetch('/api/v1/identity/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: MOCK_USER_ID,
          email: 'mock.student@clasptek.edu',
          firstName: 'John',
          lastName: 'Doe',
          provider: 'LOCAL',
          loginIdentifier: 'mock.student@clasptek.edu',
        }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to provision mock user');
      }

      await fetchProfile();
      setMessage('Mock user account successfully provisioned!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/identity/profiles/${MOCK_USER_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          avatar,
          locale,
          timeZone,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.message || 'Failed to update profile parameters');
      }

      setMessage('Profile changes successfully updated!');
      await fetchProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

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
            Manage identity and display settings. PII minimization is active in accordance with
            EGP-013.
          </p>

          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading profile metrics...</div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: '#7f1d1d',
                color: '#f87171',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1.5rem',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {message && (
            <div
              style={{
                backgroundColor: '#064e3b',
                color: '#34d399',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1.5rem',
              }}
            >
              {message}
            </div>
          )}

          {!loading && !profile && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                No active profile found for mock user ID `00000000-0000-0000-0000-000000000001`.
              </p>
              <button onClick={provisionMockUser} className="btn">
                Provision Mock User Profile
              </button>
            </div>
          )}

          {!loading && profile && (
            <form
              onSubmit={handleSave}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
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
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.png"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Locale
                  </label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--card-border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-main)',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Time Zone
                  </label>
                  <input
                    type="text"
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
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

              <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
                Save Profile Changes
              </button>
            </form>
          )}

          <div style={{ marginTop: '2rem', fontSize: '0.875rem', textAlign: 'center' }}>
            <Link href="/account">&larr; Back to Account Dashboard</Link>
          </div>
        </div>
      </main>
    </>
  );
}
