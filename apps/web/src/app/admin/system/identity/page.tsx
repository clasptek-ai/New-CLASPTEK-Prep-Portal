'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserRow {
  id: string;
  status: string;
  version: number;
  email: string;
  provider: string;
  first_name: string;
  last_name: string;
}

export default function AdminIdentityPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New user form states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [provider, setProvider] = useState('LOCAL');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/identity/users');
      if (!res.ok) throw new Error('Failed to load users database');
      const data = await res.json();
      setUsers(data.users);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/v1/identity/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          provider,
          loginIdentifier: email,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.message || 'Failed to create user aggregate');
      }

      setEmail('');
      setFirstName('');
      setLastName('');
      await fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleArchive(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/v1/identity/users/${id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: '00000000-0000-0000-0000-000000000002' }),
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.message || 'Archive transition prohibited');
      }

      await fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleRestore(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/v1/identity/users/${id}/restore`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.message || 'Restore transition prohibited');
      }

      await fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <header className="shell-header">
        <Link href="/account" className="shell-brand">
          CLASPTEK SYSTEM CONSOLE
        </Link>
        <nav className="shell-nav">
          <Link href="/admin/system/identity" className="nav-link active">
            Identity Registry
          </Link>
          <Link href="/account" className="nav-link">
            My Account
          </Link>
        </nav>
      </header>

      <main className="shell-main" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1>Identity Administration Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Reference implementation panel for managing User Aggregate transitions, multi-provider
          credentials, and Profile sync.
        </p>

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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Creation Form */}
          <div className="card">
            <h2>Provision User Aggregate</h2>
            <form
              onSubmit={handleCreateUser}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student@domain.com"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--card-border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--card-border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-main)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--card-border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-main)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                  Identity Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--card-border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="LOCAL">LOCAL</option>
                  <option value="GOOGLE">GOOGLE</option>
                  <option value="MICROSOFT">MICROSOFT</option>
                  <option value="APPLE">APPLE</option>
                </select>
              </div>

              <button type="submit" className="btn" style={{ marginTop: '0.5rem' }}>
                Create User
              </button>
            </form>
          </div>

          {/* User Database Ledger */}
          <div className="card">
            <h2>Active Users Ledger</h2>
            {loading ? (
              <div>Retrieving database list...</div>
            ) : users.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>
                No identity records exist in the database.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0' }}>User ID / Status</th>
                    <th style={{ padding: '0.5rem 0' }}>Display Name</th>
                    <th style={{ padding: '0.5rem 0' }}>Identity Binding</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>
                      Lifecycle Operations
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '1rem 0' }}>
                        <div style={{ fontWeight: 'bold' }}>{u.id.substring(0, 8)}...</div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '3px',
                            backgroundColor:
                              u.status === 'ARCHIVED'
                                ? '#ef4444'
                                : u.status === 'CREATED'
                                  ? '#3b82f6'
                                  : '#10b981',
                            color: '#fff',
                            textTransform: 'uppercase',
                          }}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        {u.first_name} {u.last_name}
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        <div>{u.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          via {u.provider}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                        {u.status !== 'ARCHIVED' ? (
                          <button
                            onClick={() => handleArchive(u.id)}
                            style={{
                              backgroundColor: '#7f1d1d',
                              color: '#f87171',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Archive
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(u.id)}
                            style={{
                              backgroundColor: '#064e3b',
                              color: '#34d399',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
