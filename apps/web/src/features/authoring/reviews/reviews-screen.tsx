'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { useNotification } from '../../../providers/notification-provider';

export function ReviewsScreen() {
  const { showSuccess, showWarning } = useNotification();
  const [reviews, setReviews] = useState([
    { id: 'r1', assetName: 'Intensive English Grammar Program Draft', type: 'Programme', dueDate: '2026-07-20', status: 'PENDING' },
    { id: 'r2', assetName: 'Adjective Modifiers Selection Quiz', type: 'Question', dueDate: '2026-07-22', status: 'PENDING' }
  ]);

  const handleAction = (id: string, approve: boolean) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, status: approve ? 'APPROVED' : 'CHANGES_REQUESTED' } : r))
    );
    if (approve) {
      showSuccess('Asset Approved!');
    } else {
      showWarning('Changes requested. Notifications sent back to author drafts inbox.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Content Reviews Workspace</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Review submitted assets, compare baseline changes and write audit outcomes</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.map((r, i) => (
          <Card key={r.id} title={r.assetName} actions={<Badge>{r.type}</Badge>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <p style={{ margin: '0 0 0.25rem 0' }}>Due Date: {r.dueDate}</p>
                <p style={{ margin: 0 }}>Review Outcome: <strong>{r.status}</strong></p>
              </div>
              {r.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="secondary" onClick={() => handleAction(r.id, false)}>Request Changes</Button>
                  <Button onClick={() => handleAction(r.id, true)}>Approve Content</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default ReviewsScreen;
