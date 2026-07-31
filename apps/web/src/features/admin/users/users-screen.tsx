'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { Table } from '../../../components/ui/ui-components';
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
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading platform user directory...</h3>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
              User Profile details: {selectedUser.name}
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
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
              backgroundColor: '#2563eb20',
              border: '1px solid #2563eb40',
              borderRadius: '8px',
              color: '#60a5fa',
              fontSize: '0.85rem',
            }}
          >
            {banner}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="Account Metadata Summary">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  fontSize: '0.9rem',
                  color: '#cbd5e1',
                }}
              >
                <div>
                  Role: <Badge>{selectedUser.role}</Badge>
                </div>
                <div>
                  Status:{' '}
                  <Badge variant={selectedUser.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  Last Login Session:{' '}
                  <strong>
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleString()
                      : 'Never'}
                  </strong>
                </div>
              </div>
            </Card>

            <Card title="Status Changes Audit logs">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedUser.statusHistory.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#0b0f19',
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
                          color: h.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                        }}
                      >
                        {h.status}
                      </span>
                      <span style={{ color: '#64748b' }}>
                        {new Date(h.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#94a3b8' }}>Reason: {h.reason}</p>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        display: 'block',
                        marginTop: '0.25rem',
                      }}
                    >
                      Updated By: {h.changedBy}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="Administrative Commands">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)}>
                  {selectedUser.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                </Button>
                <Button variant="secondary" onClick={() => handlePasswordReset(selectedUser.id)}>
                  Initiate Password Reset
                </Button>
                <div
                  style={{
                    borderTop: '1px solid #1e293b',
                    paddingTop: '1rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      color: '#94a3b8',
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
                      backgroundColor: '#0b0f19',
                      color: '#cbd5e1',
                      border: '1px solid #232e48',
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
    );
  }

  return (
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
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            Platform Users Directory
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
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
              backgroundColor: '#0b0f19',
              color: '#f8fafc',
              border: '1px solid #232e48',
            }}
          />
          <select
            value={activeRoleFilter}
            onChange={(e) => setActiveRoleFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: '#0b0f19',
              color: '#cbd5e1',
              border: '1px solid #232e48',
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
            backgroundColor: '#2563eb20',
            border: '1px solid #2563eb40',
            borderRadius: '8px',
            color: '#60a5fa',
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
                style={{ fontWeight: 600, color: '#60a5fa', cursor: 'pointer' }}
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
              <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'}>{row.status}</Badge>
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
                <Button variant="secondary" onClick={() => handleToggleStatus(row.id, row.status)}>
                  {row.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
export default UsersScreen;
