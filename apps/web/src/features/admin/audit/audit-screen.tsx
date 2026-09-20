'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Table } from '../../../components/ui/ui-components';
import { PageContainer, PageHeader, PageContent } from '../../../shared/ui/layout/PageContainer';
import { adminAuditService, AuditLogRecord } from '../../../services/admin/audit.service';
import { ShieldCheck, Activity, Lock, Cpu, Search } from 'lucide-react';

type AuditTab = 'audit' | 'events' | 'security' | 'system';

export function AuditScreen() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AuditTab>('audit');
  const [search, setSearch] = useState('');

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

  const tabs: { id: AuditTab; label: string; icon: React.ReactNode }[] = [
    { id: 'audit', label: 'Audit Logs', icon: <ShieldCheck size={16} /> },
    { id: 'events', label: 'Event Logs', icon: <Activity size={16} /> },
    { id: 'security', label: 'Security Logs', icon: <Lock size={16} /> },
    { id: 'system', label: 'System Logs', icon: <Cpu size={16} /> },
  ];

  // Tab Filtering Logic
  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    if (activeTab === 'audit') {
      return (
        matchesSearch &&
        (log.category === 'SETTINGS_CHANGE' ||
          log.category === 'CURRICULUM_PUBLISH' ||
          !log.category)
      );
    }
    if (activeTab === 'events') {
      return matchesSearch && (log.category === 'EVENT' || log.category === 'STUDENT_REGISTRATION');
    }
    if (activeTab === 'security') {
      return (
        matchesSearch &&
        (log.category === 'AUTHENTICATION' ||
          log.category === 'USER_SUSPENSION' ||
          log.category === 'GATE_ACCESS')
      );
    }
    if (activeTab === 'system') {
      return matchesSearch;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <PageContainer>
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>Loading platform audit logs history...</h3>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs"
        description="Unified compliance, security, event operational tracking, and system logs."
        actions={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.85rem',
              width: '100%',
              maxWidth: '360px',
            }}
          >
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search action logs, users, or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%',
                fontSize: '0.875rem',
              }}
            />
          </div>
        }
      />

      <PageContent>
        {/* 4 Tabs Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.25rem',
            overflowX: 'auto',
            marginBottom: '1.5rem',
          }}
        >
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--surface-1)' : 'transparent',
                  color: isActive ? 'var(--brand)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid var(--brand)' : '2px solid transparent',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Audit Table */}
        <Table
          data={filtered}
          columns={[
            {
              header: 'Action Event',
              render: (row) => (
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.action}</span>
              ),
            },
            {
              header: 'User / Identity',
              render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.user}</span>,
            },
            {
              header: 'IP Address',
              render: (row) => (
                <span style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 600 }}>
                  {row.ip}
                </span>
              ),
            },
            {
              header: 'Details',
              render: (row) => (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {row.details}
                </span>
              ),
            },
            {
              header: 'Category',
              render: (row) => (
                <Badge variant="info">{row.category || activeTab.toUpperCase()}</Badge>
              ),
            },
            {
              header: 'Timestamp',
              render: (row) => (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(row.timestamp).toLocaleString()}
                </span>
              ),
            },
          ]}
        />
      </PageContent>
    </PageContainer>
  );
}

export default AuditScreen;
