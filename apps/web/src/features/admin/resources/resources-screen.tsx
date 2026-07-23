'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Table } from '../../../components/ui/ui-components';
import { adminResourcesService, AdminResource } from '../../../services/admin/resources.service';

export function ResourcesScreen() {
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminResourcesService.getResources();
        setResources(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleArchive(id: string) {
    const success = await adminResourcesService.archiveResource(id);
    if (success) {
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'ARCHIVED' } : r)));
      showBanner('Resource successfully archived.');
    }
  }

  async function handleUploadMock() {
    try {
      const data = await adminResourcesService.uploadResource({
        title: 'Academic Writing Modifiers Blueprint',
        category: 'Writing',
        type: 'PDF',
      });
      setResources((prev) => [...prev, data]);
      showBanner('New learning resource successfully uploaded!');
    } catch (e) {
      console.error(e);
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading platform learning resources catalogue...</h3>
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
            Materials & Resources Manager
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Upload class slides, register reference links, and track downloads counters
          </p>
        </div>
        <Button onClick={handleUploadMock}>Upload New Resource</Button>
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
        data={resources}
        columns={[
          {
            header: 'Resource Title',
            render: (row) => <span style={{ fontWeight: 600 }}>{row.title}</span>,
          },
          { header: 'Type', render: (row) => <Badge>{row.type}</Badge> },
          { header: 'Category', render: (row) => <Badge>{row.category}</Badge> },
          { header: 'Downloads count', render: (row) => <span>{row.downloadsCount}</span> },
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
                {row.status === 'ACTIVE' && (
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
export default ResourcesScreen;
