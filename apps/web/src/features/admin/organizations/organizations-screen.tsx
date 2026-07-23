'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { SharedTable } from '../../../components/ui/shared-table';

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
          style={{ fontWeight: 600, color: '#60a5fa', cursor: 'pointer' }}
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
      cell: (info: any) => <span>{info.row.domain}</span>,
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
        <Button onClick={() => router.push(`/admin/organizations/${info.row.id}`)}>
          Manage Tenant
        </Button>
      ),
    },
  ];

  if (selectedOrg) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
              Tenant Workspace: {selectedOrg.name}
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Domain: {selectedOrg.domain}
            </p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/admin/organizations')}>
            Back to Directory
          </Button>
        </div>

        {/* Workspace tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid #1e293b',
            paddingBottom: '0.5rem',
          }}
        >
          {(['OVERVIEW', 'BRANDING', 'USERS', 'LICENSING'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.6rem 1.25rem',
                border: 'none',
                backgroundColor: activeTab === tab ? '#3b82f6' : 'transparent',
                color: activeTab === tab ? '#f8fafc' : '#94a3b8',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'OVERVIEW' && (
          <Card title="Tenant Properties Summary">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Licensing Expiration: **{selectedOrg.licenseExpiry}**. Database partition status:
              **HEALTHY**.
            </p>
          </Card>
        )}

        {activeTab === 'BRANDING' && (
          <Card title="Tenant Custom Branding Options">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Custom Primary color: **#3b82f6**. Header Logo mapping configured to custom bucket
              storage logs.
            </p>
          </Card>
        )}

        {activeTab === 'USERS' && (
          <Card title="Member Users Index">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Total associated members: **124 active students & instructors**.
            </p>
          </Card>
        )}

        {activeTab === 'LICENSING' && (
          <Card title="Subscription & Contract licensing limits">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Allocated Seats: **500 max**. Current Seats Usage: **25% active**.
            </p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Tenant Organizations</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Audit multi-tenant institutions billing states and domain parameters
        </p>
      </div>

      <SharedTable data={list} columns={columns} />
    </div>
  );
}
export default OrganizationsScreen;
