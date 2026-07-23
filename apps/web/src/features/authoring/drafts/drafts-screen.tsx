'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { SharedTable } from '../../../components/ui/shared-table';
import { useNotification } from '../../../providers/notification-provider';

export function DraftsScreen() {
  const [activeTab, setActiveTab] = useState<
    'MY_DRAFTS' | 'SHARED' | 'PENDING' | 'REJECTED' | 'ARCHIVED'
  >('MY_DRAFTS');
  const { showInfo } = useNotification();

  const allDrafts = [
    {
      id: 'd1',
      title: 'Adjective Modifiers Selection',
      scope: 'MY_DRAFTS',
      author: 'Jane Doe',
      lastModified: '2026-07-16',
    },
    {
      id: 'd2',
      title: 'IELTS Prep Module Outcomes',
      scope: 'SHARED',
      author: 'Bob Smith',
      lastModified: '2026-07-15',
    },
    {
      id: 'd3',
      title: 'Diagnostic Exam Pool revision',
      scope: 'PENDING',
      author: 'Jane Doe',
      lastModified: '2026-07-14',
    },
    {
      id: 'd4',
      title: 'Advanced Grammar modifiers checklist',
      scope: 'REJECTED',
      author: 'Bob Smith',
      lastModified: '2026-07-12',
    },
  ];

  const filtered = allDrafts.filter(
    (d) => d.scope === activeTab || (activeTab === 'MY_DRAFTS' && d.scope === 'MY_DRAFTS')
  );

  const columns = [
    {
      id: 'title',
      header: 'Draft Title',
      cell: (info: any) => (
        <span style={{ fontWeight: 600, color: '#10b981' }}>{info.row.title}</span>
      ),
      sortable: true,
    },
    {
      id: 'author',
      header: 'Author',
      cell: (info: any) => <span>{info.row.author}</span>,
    },
    {
      id: 'lastModified',
      header: 'Last Modified',
      cell: (info: any) => <span>{info.row.lastModified}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => (
        <Button onClick={() => showInfo(`Opening Draft editor for: ${info.row.title}`)}>
          Edit Draft
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Drafts working inbox</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Review, edit and progress drafts towards peer review validation
        </p>
      </div>

      {/* Tabs navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '0.5rem',
        }}
      >
        {(['MY_DRAFTS', 'SHARED', 'PENDING', 'REJECTED', 'ARCHIVED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.6rem 1.25rem',
              border: 'none',
              backgroundColor: activeTab === tab ? '#10b981' : 'transparent',
              color: activeTab === tab ? '#f8fafc' : '#94a3b8',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <SharedTable
        data={filtered}
        columns={columns}
        onBulkAction={(rows) => alert(`Bulk archiving ${rows.length} drafts`)}
        bulkActionLabel="Archive Selected"
      />
    </div>
  );
}
export default DraftsScreen;
