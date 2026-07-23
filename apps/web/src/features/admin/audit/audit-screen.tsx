'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Table } from '../../../components/ui/ui-components';
import { adminAuditService, AuditLogRecord } from '../../../services/admin/audit.service';

export function AuditScreen() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminAuditService.getAuditLogs();
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading platform audit logs history...</h3>
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
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Audit Logs Workspace</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Platform-wide tracking audits for security and compliance audits
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
            placeholder="Search action logs or users..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: '#0b0f19',
              color: '#cbd5e1',
              border: '1px solid #232e48',
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="AUTHENTICATION">Authentication</option>
            <option value="CURRICULUM_PUBLISH">Curriculum Publish</option>
            <option value="USER_SUSPENSION">User Suspension</option>
            <option value="SETTINGS_CHANGE">Settings Change</option>
          </select>
        </div>
      </div>

      <Table
        data={filtered}
        columns={[
          {
            header: 'Action Event',
            render: (row) => <span style={{ fontWeight: 600 }}>{row.action}</span>,
          },
          { header: 'User', render: (row) => <span>{row.user}</span> },
          {
            header: 'IP Address',
            render: (row) => <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{row.ip}</span>,
          },
          {
            header: 'Details',
            render: (row) => (
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{row.details}</span>
            ),
          },
          { header: 'Category', render: (row) => <Badge>{row.category}</Badge> },
          {
            header: 'Timestamp',
            render: (row) => (
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {new Date(row.timestamp).toLocaleString()}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
export default AuditScreen;
