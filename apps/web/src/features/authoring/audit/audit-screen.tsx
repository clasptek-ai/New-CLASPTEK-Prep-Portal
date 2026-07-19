'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';

export function AuditScreen() {
  const [filterType, setFilterType] = useState<string>('ALL');

  const logs = [
    { id: '1', user: 'Jane Doe', assetType: 'QUESTION', action: 'Created draft question Modifiers', timestamp: '2026-07-16' },
    { id: '2', user: 'Bob Smith', assetType: 'PROGRAMME', action: 'Modified outcome tags for Grammar Intensive', timestamp: '2026-07-15' },
    { id: '3', user: 'System', assetType: 'PUBLISHING', action: 'Released English Placement Exam Module A', timestamp: '2026-07-14' }
  ];

  const filteredLogs = filterType === 'ALL' ? logs : logs.filter(l => l.assetType === filterType);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Audit Logs Workspace</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Governance audits tracking author edits and publication histories</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'QUESTION', 'PROGRAMME', 'PUBLISHING'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'primary' : 'secondary'}
              onClick={() => setFilterType(type)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredLogs.map((log) => (
          <Card key={log.id} title={log.timestamp} actions={<Badge>{log.assetType}</Badge>}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#f8fafc' }}>
              <strong>{log.user}</strong>: {log.action}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default AuditScreen;
