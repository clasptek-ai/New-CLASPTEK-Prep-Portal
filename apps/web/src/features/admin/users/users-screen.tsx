'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { Table } from '../../../components/ui/ui-components';
import { PageContainer, PageContent } from '../../../shared/ui/layout/PageContainer';
import { adminUsersService, AdminUserRecord } from '../../../services/admin/users.service';

export function UsersScreen({ userId }: { userId?: string }) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [search, setSearch] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await adminUsersService.getUsers();
        setUsers(list);
        if (userId) {
          const item = list.find((u) => u.id === userId) || list[0];
          setSelectedUser(item);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const handleToggleStatus = async (id: string, currentStatus: AdminUserRecord['status']) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const reason =
      nextStatus === 'SUSPENDED'
        ? 'Administrative suspension audit check.'
        : 'Account reactivation.';
    const success = await adminUsersService.updateUserStatus(id, nextStatus, reason);
    if (success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status: nextStatus,
                statusHistory: [
                  {
                    status: nextStatus,
                    changedBy: 'Sarah Jenkins',
                    date: new Date().toISOString(),
                    reason,
                  },
                  ...u.statusHistory,
                ],
              }
            : u
        )
      );
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                status: nextStatus,
                statusHistory: [
                  {
                    status: nextStatus,
                    changedBy: 'Sarah Jenkins',
                    date: new Date().toISOString(),
                    reason,
                  },
                  ...prev.statusHistory,
                ],
              }
            : null
        );
      }
      showBanner(`Account status successfully updated to ${nextStatus}!`);
    }
  };

  const handleRoleChange = async (id: string, role: AdminUserRecord['role']) => {
    const success = await adminUsersService.assignRole(id, role);
    if (success) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser((prev) => (prev ? { ...prev, role } : null));
      }
      showBanner(`Account role changed to ${role}!`);
    }
  };

  const handlePasswordReset = async (id: string) => {
    const success = await adminUsersService.initiatePasswordReset(id);
    if (success) {
      showBanner('Verification link for password reset successfully dispatched to auth provider.');
    }
  };

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = activeRoleFilter === 'ALL' || u.role === activeRoleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <PageContainer>
        <PageContent>
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>Loading platform user directory...</h3>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (selectedUser) {
    return (
      <PageContainer>
        <PageContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                  }}
                >
                  User Profile details: {selectedUser.name}
                </h1>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Email: {selectedUser.email}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedUser(null);
                  router.push('/admin/users');
                }}
              >
                Back to Directory
              </Button>
            </div>

            {banner && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid var(--brand-primary)',
                  borderRadius: '8px',
                  color: 'var(--brand-primary)',
                  fontSize: '0.9rem',
                }}
              >
                {banner}
              </div>
            )}

            <div
              style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '1.5rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Card title="Account Overview">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Role Assignment:</span>
                      <div style={{ marginTop: '0.25rem' }}>
                        <Badge>{selectedUser.role}</Badge>
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Account Status:</span>
                      <div style={{ marginTop: '0.25rem' }}>
                        <Badge variant={selectedUser.status === 'ACTIVE' ? 'success' : 'danger'}>
                          {selectedUser.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Registered At:</span>
                      <div
                        style={{
                          marginTop: '0.25rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {selectedUser.registeredDate
                          ? new Date(selectedUser.registeredDate).toLocaleDateString()
                          : selectedUser.createdAt
                            ? new Date(selectedUser.createdAt).toLocaleDateString()
                            : '—'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Last Platform Login:</span>
                      <div
                        style={{
                          marginTop: '0.25rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {selectedUser.lastLogin
                          ? new Date(selectedUser.lastLogin).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Activity & Metrics">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '1rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Mock Tests Completed:</span>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          marginTop: '0.25rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {selectedUser.completedMocks}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Diagnostic Sessions:</span>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          marginTop: '0.25rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {selectedUser.diagnosticSessions}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Practice Questions:</span>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          marginTop: '0.25rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {selectedUser.practiceQuestionsAnswered}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '1.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border)',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Last Attempt Recorded:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {selectedUser.lastAttemptDate
                        ? new Date(selectedUser.lastAttemptDate).toLocaleString()
                        : 'Never'}
                    </strong>
                  </div>
                </Card>

                <Card title="Status Changes Audit logs">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedUser.statusHistory.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: 'var(--surface-1)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.25rem',
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: h.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)',
                            }}
                          >
                            Status changed to {h.status}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {new Date(h.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          <strong>Reason:</strong> {h.reason}
                        </div>
                        <div
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem',
                          }}
                        >
                          By: {h.changedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Card title="Administrative Commands">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Button
                      onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)}
                    >
                      {selectedUser.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handlePasswordReset(selectedUser.id)}
                    >
                      Initiate Password Reset
                    </Button>
                    <div
                      style={{
                        borderTop: '1px solid var(--border)',
                        paddingTop: '1rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Change Role Assignment:
                      </label>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleRoleChange(selectedUser.id, e.target.value as any)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="ADMINISTRATOR">Administrator</option>
                        <option value="STAFF">Staff</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                Platform Users Directory
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Search user roles, suspend/reactivate accounts, and check access permissions
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                width: '100%',
                maxWidth: '600px',
              }}
            >
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              />
              <select
                value={activeRoleFilter}
                onChange={(e) => setActiveRoleFilter(e.target.value)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMINISTRATOR">Administrator</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
          </div>

          {banner && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid var(--brand-primary)',
                borderRadius: '8px',
                color: 'var(--brand-primary)',
                fontSize: '0.85rem',
              }}
            >
              {banner}
            </div>
          )}

          <Table
            data={filtered}
            columns={[
              {
                header: 'Name',
                render: (row) => (
                  <span
                    style={{ fontWeight: 600, color: 'var(--brand-primary)', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedUser(row);
                      router.push(`/admin/users?userId=${row.id}`);
                    }}
                  >
                    {row.name}
                  </span>
                ),
              },
              { header: 'Email', render: (row) => <span>{row.email}</span> },
              { header: 'Role', render: (row) => <Badge>{row.role}</Badge> },
              {
                header: 'Status',
                render: (row) => (
                  <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {row.status}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                render: (row) => (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      onClick={() => {
                        setSelectedUser(row);
                        router.push(`/admin/users?userId=${row.id}`);
                      }}
                    >
                      Profile
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleToggleStatus(row.id, row.status)}
                    >
                      {row.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </PageContent>
    </PageContainer>
  );
}
export default UsersScreen;
