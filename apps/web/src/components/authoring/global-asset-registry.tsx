'use client';

import React, { useState } from 'react';
import { Card, Input, Button, Badge } from '../ui/ui-components';

export interface AssetRegistryItem {
  id: string;
  type: 'PROGRAMME' | 'COURSE' | 'QUESTION' | 'RESOURCE' | 'ASSESSMENT';
  title: string;
  code?: string;
  status: string;
}

export function GlobalAssetRegistry({ items }: { items: AssetRegistryItem[] }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Card title="Global Asset Registry Browser">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Input
            placeholder="Search assets registry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['ALL', 'PROGRAMME', 'COURSE', 'QUESTION', 'RESOURCE', 'ASSESSMENT'].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'primary' : 'secondary'}
                onClick={() => setFilterType(type)}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                backgroundColor: '#020617',
                fontSize: '0.85rem',
              }}
            >
              <span>
                {item.title} {item.code && <span style={{ color: '#64748b' }}>({item.code})</span>}
              </span>
              <Badge>{item.type}</Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
export default GlobalAssetRegistry;
