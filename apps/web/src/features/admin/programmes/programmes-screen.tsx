'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Table } from '../../../components/ui/ui-components';
import { adminProgrammesService, AdminProgramme } from '../../../services/admin/programmes.service';

export function ProgrammesScreen() {
  const [programmes, setProgrammes] = useState<AdminProgramme[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminProgrammesService.getProgrammes();
        setProgrammes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleArchive(id: string) {
    const success = await adminProgrammesService.archiveProgramme(id);
    if (success) {
      setProgrammes((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'ARCHIVED' } : p)));
      showBanner('Programme archived successfully!');
    }
  }

  async function handlePublish(id: string) {
    const success = await adminProgrammesService.updateProgramme(id, { status: 'PUBLISHED' });
    if (success) {
      setProgrammes((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'PUBLISHED' } : p)));
      showBanner('Programme published successfully!');
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading curriculum programmes catalogue...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          Academic Programmes Studio
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Create new catalog tracks, toggle client enrollment limits, and publish modules
        </p>
      </div>

      {banner && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#10b98120',
            border: '1px solid #10b98140',
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '0.85rem',
          }}
        >
          {banner}
        </div>
      )}

      <Table
        data={programmes}
        columns={[
          {
            header: 'Programme Title',
            render: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
          },
          { header: 'Category', render: (row) => <Badge>{row.category}</Badge> },
          {
            header: 'Status',
            render: (row) => (
              <Badge
                variant={
                  row.status === 'PUBLISHED'
                    ? 'success'
                    : row.status === 'DRAFT'
                      ? 'warning'
                      : 'danger'
                }
              >
                {row.status}
              </Badge>
            ),
          },
          { header: 'Visibility', render: (row) => <span>{row.visibility}</span> },
          {
            header: 'Enrollments',
            render: (row) => (
              <span>
                {row.currentEnrollments} / {row.enrollmentLimit}
              </span>
            ),
          },
          {
            header: 'Actions',
            render: (row) => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {row.status !== 'PUBLISHED' && (
                  <Button onClick={() => handlePublish(row.id)}>Publish</Button>
                )}
                {row.status !== 'ARCHIVED' && (
                  <Button variant="secondary" onClick={() => handleArchive(row.id)}>
                    Archive
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
export default ProgrammesScreen;
