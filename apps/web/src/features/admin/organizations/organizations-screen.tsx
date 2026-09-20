'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { SharedTable } from '../../../components/ui/shared-table';
import { PageContainer, PageHeader, PageContent } from '../../../shared/ui/layout/PageContainer';

export interface OrgItem {
  id: string;
  name: string;
  domain: string;
  status: 'ACTIVE' | 'SUSPENDED';
  licenseExpiry: string;
}

export function OrganizationsScreen({ orgId }: { orgId?: string }) {
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState<OrgItem | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BRANDING' | 'USERS' | 'LICENSING'>(
    'OVERVIEW'
  );

  const list: OrgItem[] = [
    {
      id: 'o1',
      name: 'Global Prep Institute',
      domain: 'globalprep.edu',
      status: 'ACTIVE',
      licenseExpiry: '2027-12-31',
    },
    {
      id: 'o2',
      name: 'Pre-University Diagnostics Academy',
      domain: 'preuni.edu',
      status: 'ACTIVE',
      licenseExpiry: '2026-11-30',
    },
  ];

  useEffect(() => {
    if (orgId) {
      const match = list.find((o) => o.id === orgId) || list[0];
      setSelectedOrg(match);
    }
  }, [orgId]);

  const columns = [
    {
      id: 'name',
      header: 'Institution Name',
      cell: (info: any) => (
        <span
          style={{ fontWeight: 600, color: 'var(--brand)', cursor: 'pointer' }}
          onClick={() => router.push(`/admin/organizations/${info.row.id}`)}
        >
          {info.row.name}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'domain',
      header: 'Domain Scope',
      cell: (info: any) => (
        <span style={{ color: 'var(--text-secondary)' }}>{info.row.domain}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (info: any) => (
        <Badge variant={info.row.status === 'ACTIVE' ? 'success' : 'danger'}>
          {info.row.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => (
        <Button onClick={() => router.push(`/admin/organizations/${info.row.id}`)} variant="ghost">
          Manage Tenant
        </Button>
      ),
    },
  ];

  if (selectedOrg) {
    return (
      <PageContainer>
        <PageHeader
          title={`Tenant Workspace: ${selectedOrg.name}`}
          description={`Domain: ${selectedOrg.domain}`}
          actions={
            <Button variant="secondary" onClick={() => router.push('/admin/organizations')}>
              Back to Directory
            </Button>
          }
        />

        <PageContent>
          {/* Workspace tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            {(['OVERVIEW', 'BRANDING', 'USERS', 'LICENSING'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.6rem 1.25rem',
                  border: 'none',
                  backgroundColor: activeTab === tab ? 'var(--surface-1)' : 'transparent',
                  color: activeTab === tab ? 'var(--brand)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  borderBottom:
                    activeTab === tab ? '2px solid var(--brand)' : '2px solid transparent',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'OVERVIEW' && (
            <Card title="Tenant Properties Summary">
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Licensing Expiration: <strong>{selectedOrg.licenseExpiry}</strong>. Database
                partition status: <strong style={{ color: 'var(--success)' }}>HEALTHY</strong>.
              </p>
            </Card>
          )}

          {activeTab === 'BRANDING' && (
            <Card title="Tenant Custom Branding Options">
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Custom Primary color: <strong>CLASPTEK Canonical Blue</strong>. Header Logo mapping
                configured to custom bucket storage logs.
              </p>
            </Card>
          )}

          {activeTab === 'USERS' && (
            <Card title="Member Users Index">
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Total associated members: <strong>124 active students & instructors</strong>.
              </p>
            </Card>
          )}

          {activeTab === 'LICENSING' && (
            <Card title="Subscription & Contract licensing limits">
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Allocated Seats: <strong>500 max</strong>. Current Seats Usage:{' '}
                <strong>25% active</strong>.
              </p>
            </Card>
          )}
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tenant Organizations"
        description="Audit multi-tenant institutions billing states and domain parameters"
      />
      <PageContent>
        <SharedTable data={list} columns={columns} />
      </PageContent>
    </PageContainer>
  );
}
export default OrganizationsScreen;
