'use client';

import React, { useState } from 'react';
import { Card } from '../ui/ui-components';

export interface SavedViewItem {
  id: string;
  name: string;
  filters: Record<string, any>;
}

export function SavedViewsPanel({ onSelectView }: { onSelectView: (view: SavedViewItem) => void }) {
  const [views, _setViews] = useState<SavedViewItem[]>([
    { id: '1', name: 'My Active Drafts', filters: { author: 'me', status: 'DRAFT' } },
    { id: '2', name: 'Pending Peer Reviews', filters: { status: 'PENDING_REVIEW' } },
    { id: '3', name: 'Published This Week', filters: { status: 'PUBLISHED', date: '7d' } },
  ]);

  return (
    <Card title="Author Saved Views">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onSelectView(view)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #1e293b',
              backgroundColor: '#020617',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background-color 0.2s',
            }}
          >
            ★ {view.name}
          </button>
        ))}
      </div>
    </Card>
  );
}
export default SavedViewsPanel;
