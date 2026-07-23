'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { SharedTable } from '../../../components/ui/shared-table';
import {
  authoringCurriculumService,
  AuthoringProgramme,
} from '../../../services/authoring/curriculum.service';

export function ProgrammesScreen({ programmeId }: { programmeId?: string }) {
  const router = useRouter();
  const [programmes, setProgrammes] = useState<AuthoringProgramme[]>([]);
  const [selectedProg, setSelectedProg] = useState<AuthoringProgramme | null>(null);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'CURRICULUM' | 'OUTCOMES' | 'VERSIONS' | 'PUBLISHING'
  >('OVERVIEW');

  useEffect(() => {
    async function load() {
      const list = await authoringCurriculumService.getProgrammes();
      setProgrammes(list);
      if (programmeId) {
        const item = list.find((p) => p.id === programmeId) || list[0];
        setSelectedProg(item);
      }
    }
    load();
  }, [programmeId]);

  const columns = [
    {
      id: 'name',
      header: 'Programme Name',
      cell: (info: any) => (
        <span
          style={{ fontWeight: 600, color: '#60a5fa', cursor: 'pointer' }}
          onClick={() => router.push(`/authoring/programmes/${info.row.id}`)}
        >
          {info.row.name}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'code',
      header: 'Code',
      cell: (info: any) => <span>{info.row.code}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (info: any) => (
        <Badge variant={info.row.status === 'PUBLISHED' ? 'success' : 'info'}>
          {info.row.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => (
        <Button onClick={() => router.push(`/authoring/programmes/${info.row.id}`)}>
          Configure Workspace
        </Button>
      ),
    },
  ];

  if (selectedProg) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{selectedProg.name}</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Code: {selectedProg.code} | Version: v{selectedProg.version}
            </p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/authoring/programmes')}>
            Back to Programmes List
          </Button>
        </div>

        {/* Tab navigators */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid #1e293b',
            paddingBottom: '0.5rem',
          }}
        >
          {(['OVERVIEW', 'CURRICULUM', 'OUTCOMES', 'VERSIONS', 'PUBLISHING'] as const).map(
            (tab) => (
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
                {tab}
              </button>
            )
          )}
        </div>

        {activeTab === 'OVERVIEW' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <Card title="Prerequisites & Outlines">
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
                Required Baseline: **English Placement score &gt;= 60** or course **General Syntax
                Grammar 1**.
              </p>
            </Card>
            <Card title="Workspace Settings">
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
                Assigned Curriculum Managers: **Jane Doe (Lead Author)**.
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'CURRICULUM' && (
          <Card title="Sequenced Modules tree">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Includes 3 Core modules: Syntax Modifiers, Active Vocabulary diagnostics, Paragraph
              completions. Navigate to Curriculum builder for sequence drag audits.
            </p>
          </Card>
        )}

        {activeTab === 'OUTCOMES' && (
          <Card title="Learning Outcomes Mapping">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Maps to WCAG 2.2 and IELTS Level 7 standard diagnostic capabilities parameters.
            </p>
          </Card>
        )}

        {activeTab === 'VERSIONS' && (
          <Card title="Release and version details history">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Current: **v{selectedProg.version}**. Release notes draft log is approved.
            </p>
          </Card>
        )}

        {activeTab === 'PUBLISHING' && (
          <Card title="Publishing Status and rollback targets">
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Status: **{selectedProg.status}**. Rollback target node maps to previous version.
            </p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Programmes Studio</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Create, sequence, and version program syllabus guidelines
        </p>
      </div>

      <SharedTable data={programmes} columns={columns} />
    </div>
  );
}
export default ProgrammesScreen;
