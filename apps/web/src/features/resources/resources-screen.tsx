'use client';

import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Badge } from '../../components/ui/ui-components';
import { studentResourcesService, StudentResource } from '../../services/student/resources.service';

export function ResourcesScreen() {
  const [search, setSearch] = useState('');
  const [resources, setResources] = useState<StudentResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await studentResourcesService.getResources();
        setResources(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.module.toLowerCase().includes(search.toLowerCase())
  );

  async function handleToggleBookmark(id: string) {
    const success = await studentResourcesService.toggleBookmark(id);
    if (success) {
      setResources(prev =>
        prev.map(r => (r.id === id ? { ...r, bookmarked: !r.bookmarked } : r))
      );
      const item = resources.find(r => r.id === id);
      showBanner(item?.bookmarked ? 'Bookmark removed successfully!' : 'Resource bookmarked successfully!');
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading student learning resources catalog...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Materials Catalog</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Access bookmarked lessons, videos, and study guides</p>
        </div>
        <div style={{ width: '300px' }}>
          <Input placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {banner && (
        <div style={{ padding: '1rem', backgroundColor: '#2563eb20', border: '1px solid #2563eb40', borderRadius: '8px', color: '#60a5fa', fontSize: '0.85rem' }}>
          {banner}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((r) => (
          <Card key={r.id} title={r.title} actions={<Badge>{r.resourceType}</Badge>}>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <p style={{ margin: 0 }}>{r.description}</p>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Module: <strong>{r.module}</strong> | Lesson: <strong>{r.lesson}</strong>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', margin: '0.25rem 0' }}>
                {r.tags.map((t, i) => <Badge key={i} variant="info">{t}</Badge>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Downloads: {r.downloadsCount}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button onClick={() => showBanner(`Opening resource "${r.title}" in new tab...`)}>Open</Button>
                  <Button variant="secondary" onClick={() => handleToggleBookmark(r.id)}>
                    {r.bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default ResourcesScreen;
